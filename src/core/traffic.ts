import { Clock, Effect, Exit, Ref, Scope, Semaphore } from 'effect';

export interface TrafficBudget {
  readonly maxInFlight: number;
  readonly maxWaiting: number;
  readonly waitMs: number;
  readonly hostRate: number;
  readonly hostBurst: number;
  readonly identityRate: number;
  readonly identityBurst: number;
}

export const DEFAULT_TRAFFIC_BUDGET: TrafficBudget = {
  identityBurst: 4,
  identityRate: 2,
  hostBurst: 8,
  hostRate: 4,
  maxInFlight: 8,
  maxWaiting: 32,
  waitMs: 2_000,
};

export class TrafficRejectedError extends Error {
  constructor(
    readonly status: 429 | 503,
    message: string,
    readonly retryAfterMs = 1_000,
  ) {
    super(message);
    this.name = 'TrafficRejectedError';
  }
}

interface Bucket {
  readonly tokens: number;
  readonly updatedAt: number;
}
interface Counters {
  readonly active: number;
  readonly waiting: number;
  readonly peakActive: number;
  readonly peakWaiting: number;
  readonly cooldownHits: number;
}

export class TrafficGovernor {
  private readonly semaphore: Semaphore.Semaphore;
  private readonly buckets = Ref.makeUnsafe({
    hosts: new Map<string, Bucket>(),
    identities: new Map<string, Bucket>(),
  });
  private readonly cooldowns = Ref.makeUnsafe(new Map<string, number>());
  private readonly counters = Ref.makeUnsafe<Counters>({
    active: 0,
    waiting: 0,
    peakActive: 0,
    peakWaiting: 0,
    cooldownHits: 0,
  });

  constructor(readonly budget: TrafficBudget = DEFAULT_TRAFFIC_BUDGET) {
    for (const value of Object.values(budget)) {
      if (!Number.isFinite(value) || value <= 0)
        {throw new TypeError('Traffic limits must be positive');}
    }
    this.semaphore = Semaphore.makeUnsafe(budget.maxInFlight);
  }

  get snapshot() {
    return Effect.runSync(Ref.get(this.counters));
  }

  resetPeaks(): void {
    Effect.runSync(
      Ref.update(this.counters, (current) => ({
        ...current,
        peakActive: current.active,
        peakWaiting: current.waiting,
      })),
    );
  }

  withPermit<A, E, R>(
    host: string,
    identity: string,
    work: Effect.Effect<A, E, R>,
    waitForRate = false,
  ) {
    const { budget, counters, buckets, semaphore } = this;
    const checkCooling = this.checkCooling.bind(this);
    const enterQueue = Effect.gen(function* () {
      yield* checkCooling(host, identity);
      const admitted = yield* Ref.modify(counters, (current) =>
        current.waiting >= budget.maxWaiting
          ? [false, current]
          : [
              true,
              {
                ...current,
                waiting: current.waiting + 1,
                peakWaiting: Math.max(current.peakWaiting, current.waiting + 1),
              },
            ],
      );
      if (!admitted) {
        yield* Effect.fail(
          new TrafficRejectedError(503, 'Upstream traffic queue is full'),
        );
      }
    });
    const acquire = Effect.acquireUseRelease(
      enterQueue,
      () =>
        Effect.gen(function* () {
          const parentScope = yield* Scope.Scope;
          while (true) {
            yield* checkCooling(host, identity);
            const attemptScope = yield* Scope.fork(parentScope);
            const taken = yield* Effect.gen(function* () {
              const permit = yield* Effect.acquireRelease(
                semaphore.takeIfAvailable(1),
                (acquired) => (acquired ? semaphore.release(1) : Effect.void),
              );
              if (!permit) {
                return false;
              }
              yield* checkCooling(host, identity);
              const now = yield* Clock.currentTimeMillis;
              const reserved = yield* Ref.modify(buckets, (current) => {
                const hostBuckets = new Map(current.hosts);
                const identityBuckets = new Map(current.identities);
                pruneBuckets(
                  hostBuckets,
                  now,
                  (budget.hostBurst / budget.hostRate) * 1_000,
                );
                pruneBuckets(
                  identityBuckets,
                  now,
                  (budget.identityBurst / budget.identityRate) * 1_000,
                );
                const next = {
                  hosts: hostBuckets,
                  identities: identityBuckets,
                };
                if (
                  (!hostBuckets.has(host) && hostBuckets.size >= 10_000) ||
                  (!identityBuckets.has(identity) &&
                    identityBuckets.size >= 10_000)
                ) {
                  return ['capacity' as const, next];
                }
                const hostTokens = availableTokens(
                  hostBuckets.get(host),
                  budget.hostRate,
                  budget.hostBurst,
                  now,
                );
                const identityTokens = availableTokens(
                  identityBuckets.get(identity),
                  budget.identityRate,
                  budget.identityBurst,
                  now,
                );
                if (hostTokens < 1 || identityTokens < 1) {
                  return ['rate' as const, next];
                }
                hostBuckets.set(host, {
                  tokens: hostTokens - 1,
                  updatedAt: now,
                });
                identityBuckets.set(identity, {
                  tokens: identityTokens - 1,
                  updatedAt: now,
                });
                return ['reserved' as const, next];
              });
              if (reserved !== 'reserved') {
                if (reserved === 'rate' && waitForRate) {
                  return false;
                }
                return yield* Effect.fail(
                  new TrafficRejectedError(
                    503,
                    reserved === 'capacity'
                      ? 'Traffic identity capacity exhausted'
                      : 'Upstream rate budget is exhausted',
                    1_000,
                  ),
                );
              }
              yield* Effect.acquireRelease(
                Ref.update(counters, (current) => ({
                  ...current,
                  active: current.active + 1,
                  peakActive: Math.max(current.peakActive, current.active + 1),
                })),
                () =>
                  Ref.update(counters, (current) => ({
                    ...current,
                    active: current.active - 1,
                  })),
              );
              return true;
            }).pipe(Effect.provideService(Scope.Scope, attemptScope));
            if (taken) {
              return;
            }
            yield* Scope.close(attemptScope, Exit.void);
            yield* Effect.sleep(10);
          }
        }).pipe(
          Effect.timeoutOrElse({
            duration: budget.waitMs,
            orElse: () =>
              Effect.fail(
                new TrafficRejectedError(503, 'Upstream admission timed out'),
              ),
          }),
        ),
      () =>
        Ref.update(counters, (current) => ({
          ...current,
          waiting: current.waiting - 1,
        })),
    );
    return Effect.scoped(acquire.pipe(Effect.andThen(work)));
  }

  cool(host: string, identity: string, retryAfterMs = 30_000) {
    const { cooldowns } = this;
    return Effect.gen(function* () {
      const now = yield* Clock.currentTimeMillis;
      const until = now + Math.min(Math.max(retryAfterMs, 1_000), 300_000);
      yield* Ref.update(cooldowns, (entries) => {
        for (const [key, value] of entries) {
          if (value <= now) {entries.delete(key);}
        }
        for (const key of [`host:${host}`, `identity:${identity}`]) {
          entries.set(key, Math.max(entries.get(key) ?? 0, until));
        }
        return entries;
      });
    });
  }

  private checkCooling(host: string, identity: string) {
    const { cooldowns, counters } = this;
    return Effect.gen(function* () {
      const now = yield* Clock.currentTimeMillis;
      const entries = yield* Ref.get(cooldowns);
      const until = Math.max(
        entries.get(`host:${host}`) ?? 0,
        entries.get(`identity:${identity}`) ?? 0,
      );
      if (until > now) {
        yield* Ref.update(counters, (current) => ({
          ...current,
          cooldownHits: current.cooldownHits + 1,
        }));
        return yield* Effect.fail(
          new TrafficRejectedError(
            429,
            'Upstream is cooling down',
            until - now,
          ),
        );
      }
      return undefined;
    });
  }
}

const availableTokens = (
  bucket: Bucket | undefined,
  rate: number,
  burst: number,
  now: number,
): number => {
  return bucket
    ? Math.min(burst, bucket.tokens + ((now - bucket.updatedAt) * rate) / 1_000)
    : burst;
};

const pruneBuckets = (
  entries: Map<string, Bucket>,
  now: number,
  idleMs: number,
): void => {
  for (const [key, value] of entries) {
    if (now - value.updatedAt > idleMs) {entries.delete(key);}
  }
};

let defaultGovernor: TrafficGovernor | undefined;
export const getDefaultTrafficGovernor = (): TrafficGovernor => {
  return (defaultGovernor ??= new TrafficGovernor());
};
export const resetDefaultTrafficGovernor = (): void => {
  defaultGovernor = undefined;
};
