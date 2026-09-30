import { createHash } from 'node:crypto';

import { Effect, Ref } from 'effect';

import type {
  CookieRecord,
  IdentityPoolConfig,
  ModuleCallConfig,
  RuntimeState,
} from '../types/index.ts';
import { registerAnonymousEffect } from './anonymous.ts';
import type { RequestError } from './errors.ts';
import { ReadStore } from './read-store.ts';
import { ProcessServices } from './runtime.ts';
import { resolveRequestCookie } from './utils.ts';

export interface IdentitySnapshot {
  readonly cookie: Readonly<CookieRecord>;
  readonly state: Readonly<RuntimeState>;
  readonly fingerprint: string;
  readonly source:
    | 'cookie-user'
    | 'cookie-anonymous'
    | 'runtime-anonymous'
    | 'device';
}

export const resolveIdentitySnapshot = (
  config: ModuleCallConfig,
  state: RuntimeState,
): IdentitySnapshot => {
  const cookie = resolveRequestCookie(config);
  const source = cookie.MUSIC_U
    ? 'cookie-user'
    : cookie.MUSIC_A
      ? 'cookie-anonymous'
      : state.anonymousToken
        ? 'runtime-anonymous'
        : 'device';
  const value =
    cookie.MUSIC_U || cookie.MUSIC_A || state.anonymousToken || state.deviceId;
  if (!cookie.MUSIC_U && !cookie.MUSIC_A && state.anonymousToken) {
    cookie.MUSIC_A = state.anonymousToken;
  }
  return Object.freeze({
    cookie: Object.freeze(cookie),
    state: Object.freeze({ ...state }),
    fingerprint: createHash('sha256').update(String(value)).digest('hex'),
    source,
  });
};

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
            const registration = yield* registerAnonymousEffect({
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
      return values[index]!;
    }),
  };
};
