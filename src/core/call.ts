import { createHash } from 'node:crypto';

import {
  Cause,
  Clock,
  Context,
  Effect,
  Exit,
  Layer,
  Option,
  Ref,
} from 'effect';

import type {
  CreateHanaMusicApiConfig,
  ModuleCallConfig,
  ModuleDefinition,
  ModuleQuery,
  NcmApiResponse,
  RequestCapability,
} from '../types/index.ts';
import { ensureAnonymousEffect } from './anonymous.ts';
import {
  isCacheable,
  isReadModule,
  isUploadModule,
} from './endpoint-policy.ts';
import { DeadlineExceeded, PartialUpload } from './errors.ts';
import { createIdentityPool, resolveIdentitySnapshot } from './identity.ts';
import type { IdentitySnapshot, IdentityPool } from './identity.ts';
import { ReadStore } from './read-store.ts';
import { requestEffect, withRequestDeadline } from './request.ts';
import { ProcessServices, runPublicEffect } from './runtime.ts';
import { resolveRequestCookie, stableStringify } from './utils.ts';

export { ProcessServices, createProcessLayer } from './runtime.ts';

export type CallConfig = Omit<ModuleCallConfig, 'signal'>;

export interface CallInput {
  readonly identifier: string;
  readonly input: unknown;
  readonly config: CallConfig;
  readonly signal?: AbortSignal;
}

export interface Call {
  readonly identifier: string;
  readonly input: Readonly<ModuleQuery>;
  readonly config: CallConfig;
  readonly identity: IdentitySnapshot;
  readonly policy: {
    readonly read: boolean;
    readonly upload: boolean;
    readonly cache?: boolean;
    readonly cacheable?: (response: NcmApiResponse) => boolean;
    readonly stageTimeoutMs?: number;
  };
  readonly startedAt: number;
  readonly deadlineAt?: number;
}

export const Call = Context.Service<Call>('hana/Call');

export class CallServices extends Context.Service<
  CallServices,
  {
    readonly process: Context.Service.Shape<typeof ProcessServices>;
    readonly reads: ReadStore<NcmApiResponse>;
    readonly pool: IdentityPool | null;
    readonly initializeAnonymous: boolean;
  }
>()('hana/CallServices') {}

export const createClientLayer = (
  process: Layer.Layer<ProcessServices>,
  config: CreateHanaMusicApiConfig = {},
  initializeAnonymous = true,
) => {
  const services = Effect.runSync(Effect.provide(ProcessServices, process));
  return Layer.succeed(CallServices, {
    process: services,
    reads: new ReadStore<NcmApiResponse>(
      config.cache && config.cache.enabled !== false
        ? (config.cache.ttlMs ?? 120_000)
        : null,
    ),
    pool: config.identityPool
      ? createIdentityPool(config.identityPool, config)
      : null,
    initializeAnonymous,
  });
};

export const createServiceLayer = (
  process: Layer.Layer<ProcessServices>,
  cacheTtlMs: number | null = 120_000,
) => {
  return createClientLayer(
    process,
    { cache: cacheTtlMs === null ? { enabled: false } : { ttlMs: cacheTtlMs } },
    false,
  );
};

const effectReferences = new WeakMap<object, number>();
let nextEffectReference = 1;

export const runCall = <Input extends ModuleQuery>(
  input: CallInput,
  services: Layer.Layer<CallServices>,
  implementation: ModuleDefinition<string, Input>,
  request: RequestCapability = requestEffect,
): Promise<NcmApiResponse> => {
  const upload = isUploadModule(input.identifier);
  const configuredTimeout = input.config.timeoutMs;
  const timeoutMs = upload
    ? configuredTimeout && configuredTimeout > 0
      ? Math.min(configuredTimeout, 300_000)
      : 300_000
    : (configuredTimeout ?? 8_000);
  const moduleFailure = Ref.makeUnsafe(Option.none<PartialUpload>());
  const work = Effect.gen(function* () {
    const startedAt = yield* Clock.currentTimeMillis;
    const decodedInput = yield* implementation.decodeInput(input.input);
    const scoped = yield* CallServices;
    const config = {
      ...input.config,
      cookie: resolveRequestCookie(input.config),
      headers: input.config.headers
        ? Object.freeze({ ...input.config.headers })
        : undefined,
      retry: input.config.retry
        ? Object.freeze({
            ...input.config.retry,
            statusCodes: input.config.retry.statusCodes
              ? Object.freeze([...input.config.retry.statusCodes])
              : undefined,
          })
        : undefined,
      state: input.config.state
        ? Object.freeze({ ...input.config.state })
        : undefined,
    };
    const explicitIdentity =
      config.cookie.MUSIC_U ||
      config.cookie.MUSIC_A ||
      config.state?.anonymousToken;
    const identityConfig =
      !explicitIdentity && scoped.pool
        ? yield* scoped.pool.next.pipe(
            Effect.provideService(ProcessServices, scoped.process),
          )
        : undefined;
    if (!explicitIdentity && !scoped.pool && scoped.initializeAnonymous) {
      yield* ensureAnonymousEffect(config).pipe(
        Effect.provideService(ProcessServices, scoped.process),
      );
    }
    const effective = identityConfig
      ? {
          ...config,
          ...identityConfig,
          state: Object.freeze({ ...identityConfig.state, ...config.state }),
        }
      : config;
    const identity = resolveIdentitySnapshot(
      effective,
      scoped.process.readState(effective.state),
    );
    const read = isReadModule(input.identifier);
    const call: Call = Object.freeze({
      identifier: input.identifier,
      input: Object.freeze({ ...decodedInput }),
      config: Object.freeze({
        ...effective,
        cookie:
          Object.keys(identity.cookie).length ||
          input.config.cookie !== undefined
            ? identity.cookie
            : undefined,
      }),
      identity,
      policy: Object.freeze({
        read,
        upload,
        cache: read,
        cacheable: isCacheable,
        stageTimeoutMs: upload ? 60_000 : undefined,
      }),
      startedAt,
      deadlineAt: timeoutMs > 0 ? startedAt + timeoutMs : undefined,
    });

    const executionCall = call.policy.read
      ? {
          ...call,
          deadlineAt: undefined,
          config: { ...call.config, timeoutMs: undefined },
        }
      : call;
    const capability: RequestCapability =
      request === requestEffect
        ? request
        : (intent) => withRequestDeadline(request(intent));
    const execute = implementation
      .execute(call.input as Input, capability)
      .pipe(
        Effect.onExit((exit) => {
          const error = Exit.isFailure(exit)
            ? Cause.squash(exit.cause)
            : undefined;
          return error instanceof PartialUpload
            ? Ref.set(moduleFailure, Option.some(error))
            : Effect.void;
        }),
        Effect.provideService(Call, executionCall),
        Effect.provideService(ProcessServices, scoped.process),
      );
    if (!call.policy.read) {
      return yield* execute;
    }
    const {
      onRequestEvent: _events,
      timeoutMs: _timeout,
      ...keyConfig
    } = call.config;
    const references = [
      implementation.execute,
      call.config.fetcher,
      request,
    ].map((reference) => {
      if (!reference) {
        return 0;
      }
      if (!effectReferences.has(reference)) {
        effectReferences.set(reference, nextEffectReference++);
      }
      return effectReferences.get(reference)!;
    });
    const key = createHash('sha256')
      .update(
        stableStringify({
          identifier: call.identifier,
          input: call.input,
          config: keyConfig,
          identity: call.identity.fingerprint,
          references,
        }),
      )
      .digest('hex');
    return yield* scoped.reads.run(key, execute, {
      cache: call.policy.cache,
      cacheable: call.policy.cacheable,
    });
  });
  return runPublicEffect(
    (timeoutMs > 0
      ? work.pipe(
          Effect.timeoutOrElse({
            duration: timeoutMs,
            orElse: () =>
              Effect.fail(
                new DeadlineExceeded({ message: 'Request timed out' }),
              ),
          }),
        )
      : work
    ).pipe(Effect.provide(services)),
    input.signal,
    () => Option.getOrUndefined(Effect.runSync(Ref.get(moduleFailure))),
  );
};
