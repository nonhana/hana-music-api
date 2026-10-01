import { Effect, Ref } from 'effect';

import type { IdentityPoolConfig, ModuleCallConfig } from '../types/index.ts';
import type { RequestError } from './errors.ts';
import { TransportFailed } from './errors.ts';
import { ReadStore } from './read-store.ts';
import { ProcessServices } from './runtime.ts';

export {
  resolveIdentitySnapshot,
  type IdentitySnapshot,
} from './identity-snapshot.ts';

export interface AnonymousRegistration {
  readonly anonymousToken: string;
  readonly cnIp: string;
  readonly deviceId: string;
}

export type RegisterAnonymous = (
  options: ModuleCallConfig,
) => Effect.Effect<AnonymousRegistration, RequestError, ProcessServices>;

export interface IdentityPool {
  readonly next: Effect.Effect<
    Partial<ModuleCallConfig>,
    RequestError,
    ProcessServices
  >;
}

export const createIdentityPool = (
  config: IdentityPoolConfig,
  options: ModuleCallConfig,
  registerAnonymous: RegisterAnonymous,
): IdentityPool => {
  if (!Number.isFinite(config.size) || config.size < 1) {
    throw new TypeError('identityPool.size must be positive');
  }
  const size = Math.floor(config.size);
  const cursor = Ref.makeUnsafe(0);
  const identities = Ref.makeUnsafe<Array<Partial<ModuleCallConfig>>>([]);
  const initialization = new ReadStore<void, RequestError>(null);
  return {
    next: Effect.gen(function* () {
      const process = yield* ProcessServices;
      yield* initialization.run(
        'pool',
        Effect.gen(function* () {
          for (
            let index = (yield* Ref.get(identities)).length;
            index < size;
            index += 1
          ) {
            const registration = yield* registerAnonymous({
              ...options,
              timeoutMs: 0,
            });
            yield* Ref.update(identities, (values) => [
              ...values,
              {
                cookie: { MUSIC_A: registration.anonymousToken },
                ip: registration.cnIp,
                state: registration,
              },
            ]);
          }
        }).pipe(Effect.provideService(ProcessServices, process)),
      );
      const values = yield* Ref.get(identities);
      const index = yield* Ref.modify(cursor, (value) => [
        value % size,
        value + 1,
      ]);
      // 池已由上方 initialization 循环填满 size 条；越界仅发生于异常并发，取模兜底。
      const identity = values[index] ?? values[index % size];
      if (identity === undefined) {
        return yield* new TransportFailed({
          message: 'IdentityPool initialization failed',
          cause: new Error(`pool empty at index ${index}`),
        });
      }
      return identity;
    }),
  };
};
