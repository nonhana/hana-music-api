import { isIP } from 'node:net';

import { Clock, Effect, Option, Ref, Semaphore } from 'effect';
import type { Context, MiddlewareHandler } from 'hono';

import { isUploadModule } from '../core/endpoint-policy.ts';
import { TrafficRejectedError } from '../core/traffic.ts';
import type { CreateServerOptions, TrafficOptions } from '../types/index.ts';

const requestIps = new WeakMap<Request, string>();

export const setConnectionIp = (request: Request, ip: string): void => {
  requestIps.set(request, ip);
};

export const resolveAdmissionIdentity = (
  context: Context,
  options: CreateServerOptions,
): string => {
  const connectionIp =
    options.connectionIp?.(context.req.raw) ??
    requestIps.get(context.req.raw) ??
    'unknown';
  if (
    isIP(connectionIp) &&
    options.traffic?.trustedProxyIps?.includes(connectionIp)
  ) {
    const candidate = context.req
      .header('x-forwarded-for')
      ?.split(',')
      .map((entry) => entry.trim())
      .find((entry) => isIP(entry));
    if (candidate) {
      return candidate;
    }
  }
  return connectionIp;
};

export class AdmissionController {
  private readonly buckets = Ref.makeUnsafe(
    new Map<string, { tokens: number; time: number }>(),
  );
  private readonly modules: Semaphore.Semaphore;
  private readonly uploads: Semaphore.Semaphore;
  private readonly counts = Ref.makeUnsafe({ active: 0, uploadActive: 0 });

  constructor(private readonly options: TrafficOptions = {}) {
    for (const value of [
      options.burst,
      options.maxInFlight,
      options.maxUploads,
      options.requestsPerSecond,
    ]) {
      if (value !== undefined && (!Number.isFinite(value) || value <= 0)) {
        throw new TypeError('Traffic limits must be positive');
      }
    }
    this.modules = Semaphore.makeUnsafe(options.maxInFlight ?? 32);
    this.uploads = Semaphore.makeUnsafe(options.maxUploads ?? 2);
  }

  get snapshot() {
    return Effect.runSync(Ref.get(this.counts));
  }

  run<A, E, R>(
    identity: string,
    upload: boolean,
    work: Effect.Effect<A, E, R>,
  ) {
    const {
      buckets: bucketState,
      counts: countState,
      modules,
      options,
      uploads,
    } = this;
    return Effect.gen(function* () {
      const now = yield* Clock.currentTimeMillis;
      const allowed = yield* Ref.modify(bucketState, (buckets) => {
        const burst = options.burst ?? 10;
        const rate = options.requestsPerSecond ?? 2;
        const previous = buckets.get(identity) ?? { tokens: burst, time: now };
        const tokens = Math.min(
          burst,
          previous.tokens + ((now - previous.time) * rate) / 1_000,
        );
        for (const [key, entry] of buckets) {
          if (now - entry.time > (burst / rate) * 1_000) {buckets.delete(key);}
        }
        if (!buckets.has(identity) && buckets.size >= 10_000) {
          return [false, buckets];
        }
        buckets.set(identity, {
          time: now,
          tokens: tokens >= 1 ? tokens - 1 : tokens,
        });
        return [tokens >= 1, buckets];
      });
      if (!allowed) {
        return yield* Effect.fail(
          new TrafficRejectedError(429, 'Too Many Requests', 1_000),
        );
      }
      const counted = Effect.gen(function* () {
        yield* Ref.update(countState, (counts) => ({
          active: counts.active + 1,
          uploadActive: counts.uploadActive + Number(upload),
        }));
        return yield* work.pipe(
          Effect.ensuring(
            Ref.update(countState, (counts) => ({
              active: counts.active - 1,
              uploadActive: counts.uploadActive - Number(upload),
            })),
          ),
        );
      });
      const guarded = upload
        ? uploads
            .withPermitsIfAvailable(1)(counted)
            .pipe(
              Effect.flatMap((result) =>
                Option.isSome(result)
                  ? Effect.succeed(result.value)
                  : Effect.fail(
                      new TrafficRejectedError(
                        503,
                        'Upload capacity exhausted',
                        1_000,
                      ),
                    ),
              ),
            )
        : counted;
      const result = yield* modules.withPermitsIfAvailable(1)(guarded);
      if (Option.isNone(result)) {
        return yield* Effect.fail(
          new TrafficRejectedError(503, 'Module capacity exhausted', 1_000),
        );
      }
      return result.value;
    });
  }
}

export const admissionMiddleware = (
  controller: AdmissionController,
  options: CreateServerOptions,
  identifier: string,
): MiddlewareHandler => {
  return async (context, next) => {
    try {
      await Effect.runPromise(
        controller.run(
          resolveAdmissionIdentity(context, options),
          isUploadModule(identifier),
          Effect.tryPromise({ try: () => next(), catch: (error) => error }),
        ),
        { signal: context.req.raw.signal },
      );
      return undefined;
    } catch (error) {
      if (error instanceof TrafficRejectedError) {
        return context.json(
          { code: error.status, msg: error.message },
          error.status,
          {
            'Retry-After': String(
              Math.ceil((error.retryAfterMs ?? 1_000) / 1_000),
            ),
          },
        );
      }
      if (context.req.raw.signal.aborted) {
        return Response.json(
          { code: 499, msg: 'Request cancelled' },
          { status: 499 },
        );
      }
      throw error;
    }
  };
};
