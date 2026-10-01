import { Clock, Deferred, Effect, Exit, Fiber, Ref } from 'effect';

export interface ReadStoreRunOptions<Value> {
  readonly cache?: boolean;
  readonly cacheable?: (value: Value) => boolean;
  readonly clone?: (value: Value) => Value;
}

interface CacheEntry<Value> {
  readonly expiresAt: number;
  readonly value: Value;
}

interface InFlight<Value, Failure> {
  readonly result: Deferred.Deferred<Value, Failure>;
  readonly waiters: number;
  readonly fiber: Fiber.Fiber<Value, Failure>;
}

interface ReadState<Value, Failure> {
  readonly inFlight: Map<string, InFlight<Value, Failure>>;
  readonly cache: Map<string, CacheEntry<Value>>;
}

type ReadDecision<Value, Failure> =
  | { readonly cached: true; readonly value: Value }
  | { readonly cached: false; readonly entry: InFlight<Value, Failure> };

export class ReadStore<Value = unknown, Failure = unknown> {
  private readonly state = Ref.makeUnsafe<ReadState<Value, Failure>>({
    inFlight: new Map(),
    cache: new Map(),
  });
  private readonly cacheHits = Ref.makeUnsafe(0);
  private readonly merged = Ref.makeUnsafe(0);

  constructor(private readonly ttlMs: number | null) {}

  get snapshot(): { inflight: number; cacheHits: number; merged: number } {
    return {
      inflight: Effect.runSync(Ref.get(this.state)).inFlight.size,
      cacheHits: Effect.runSync(Ref.get(this.cacheHits)),
      merged: Effect.runSync(Ref.get(this.merged)),
    };
  }

  run(
    key: string,
    effect: Effect.Effect<Value, Failure>,
    options: ReadStoreRunOptions<Value> = {},
  ): Effect.Effect<Value, Failure> {
    const { state, cacheHits, merged, ttlMs } = this;
    const clone = options.clone ?? structuredClone<Value>;
    return Effect.uninterruptibleMask((restore) =>
      Effect.gen(function* () {
        const start = Deferred.makeUnsafe<void>();
        const result = Deferred.makeUnsafe<Value, Failure>();
        const fiber = yield* Deferred.await(start).pipe(
          Effect.andThen(effect),
          Effect.onExit((exit) =>
            Effect.gen(function* () {
              const timestamp = yield* Clock.currentTimeMillis;
              yield* Ref.update(state, (current) => {
                if (current.inFlight.get(key)?.result !== result) {
                  return current;
                }
                const cache = new Map(
                  [...current.cache].filter(
                    ([, entry]) => entry.expiresAt > timestamp,
                  ),
                );
                if (
                  Exit.isSuccess(exit) &&
                  options.cache &&
                  ttlMs !== null &&
                  options.cacheable?.(exit.value)
                ) {
                  if (cache.size >= 10_000) {
                    for (const oldest of cache.keys()) {
                      cache.delete(oldest);
                      break;
                    }
                  }
                  cache.set(key, {
                    expiresAt: timestamp + ttlMs,
                    value: clone(exit.value),
                  });
                }
                return { cache, inFlight: remove(current.inFlight, key) };
              });
              yield* Deferred.done(result, exit);
            }),
          ),
          Effect.forkDetach({ uninterruptible: false }),
        );
        const candidate: InFlight<Value, Failure> = {
          result,
          fiber,
          waiters: 1,
        };
        const now = yield* Clock.currentTimeMillis;
        const decision = yield* Ref.modify(
          state,
          (
            current,
          ): [ReadDecision<Value, Failure>, ReadState<Value, Failure>] => {
            const cached = current.cache.get(key);
            if (options.cache && cached && cached.expiresAt > now) {
              return [{ cached: true, value: cached.value }, current];
            }
            const cache =
              cached && cached.expiresAt <= now
                ? remove(current.cache, key)
                : current.cache;
            const existing = current.inFlight.get(key);
            return existing
              ? [
                  { cached: false, entry: existing },
                  {
                    cache,
                    inFlight: new Map(current.inFlight).set(key, {
                      ...existing,
                      waiters: existing.waiters + 1,
                    }),
                  },
                ]
              : [
                  { cached: false, entry: candidate },
                  {
                    cache,
                    inFlight: new Map(current.inFlight).set(key, candidate),
                  },
                ];
          },
        );
        if (decision.cached) {
          yield* Fiber.interrupt(fiber);
          yield* Ref.update(cacheHits, (value) => value + 1);
          return clone(decision.value);
        }
        const joined = decision.entry;
        if (joined === candidate) {
          yield* Deferred.succeed(start, undefined);
        } else {
          yield* Ref.update(merged, (value) => value + 1);
          yield* Fiber.interrupt(fiber);
        }
        return yield* restore(Deferred.await(joined.result)).pipe(
          Effect.map(clone),
          Effect.ensuring(
            Effect.gen(function* () {
              const interrupt = yield* Ref.modify(state, (values) => {
                const current = values.inFlight.get(key);
                if (current?.result !== joined.result) {
                  return [false, values];
                }
                return current.waiters === 1
                  ? [
                      true,
                      { ...values, inFlight: remove(values.inFlight, key) },
                    ]
                  : [
                      false,
                      {
                        ...values,
                        inFlight: new Map(values.inFlight).set(key, {
                          ...current,
                          waiters: current.waiters - 1,
                        }),
                      },
                    ];
              });
              if (interrupt) {
                yield* Fiber.interrupt(joined.fiber);
              }
            }),
          ),
        );
      }),
    );
  }
}

const remove = <Value>(
  entries: Map<string, Value>,
  key: string,
): Map<string, Value> => {
  const next = new Map(entries);
  next.delete(key);
  return next;
};
