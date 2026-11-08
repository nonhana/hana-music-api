import { Clock, Effect, Ref } from 'effect';

import type { ModuleCallConfig } from '../types/index.ts';
import { Call } from './call-context.ts';
import type { InternalExecution } from './call-context.ts';
import type { RequestError } from './errors.ts';
import { DeadlineExceeded, ResponseDecodeFailed } from './errors.ts';
import { isDeviceId, resolveIdentitySnapshot } from './identity.ts';
import { ReadStore } from './read-store.ts';
import { buildActionRequestIntent } from './request-intent.ts';
import { requestEffect } from './request.ts';
import {
  getRuntimeState,
  ProcessServices,
  resolveProcessServices,
  runPublicEffect,
  setRuntimeState,
} from './runtime.ts';
import {
  cookieToJson,
  encodeAnonymousDeviceId,
  generateRandomChineseIP,
} from './utils.ts';

export interface AnonymousRegistration {
  readonly anonymousToken: string;
  readonly cnIp: string;
  readonly deviceId: string;
}

export interface EnsureAnonymousTokenOptions extends ModuleCallConfig {}

const registrations = new WeakMap<object, ReadStore<string, RequestError>>();
const sharedRegistrationKey = {};

const createAnonymousUsername = (deviceId: string): string => {
  const digest = encodeAnonymousDeviceId(deviceId);

  return Buffer.from(`${deviceId} ${digest}`, 'utf8').toString('base64');
};

export const registerAnonymousEffect = (
  options: ModuleCallConfig & {
    readonly cnIp?: string;
  } = {},
  execution?: InternalExecution,
): Effect.Effect<AnonymousRegistration, RequestError> =>
  Effect.gen(function* () {
    const runtime = getRuntimeState();
    const snapshot = resolveIdentitySnapshot(
      { ...options, state: { ...options.state, anonymousToken: '' } },
      {
        ...runtime,
        anonymousToken: '',
        deviceId: isDeviceId(options.deviceId)
          ? options.deviceId
          : runtime.deviceId,
      },
    );
    const deviceId = snapshot.state.deviceId;
    const cnIp =
      options.cnIp ?? options.state?.cnIp ?? generateRandomChineseIP();
    const state = { anonymousToken: '', cnIp, deviceId };
    // 隐式身份初始化不消费业务调用的 token；显式注册模块仍从自己的 Call 配置取值。
    const config = {
      ...options,
      checkToken: undefined,
      crypto: 'weapi' as const,
      ip: cnIp,
      state,
      cookie: snapshot.cookie,
    };
    const actions = {
      register: {
        profile: 'web',
        target: '/api/register/anonimous',
        semantic: 'login',
        cache: 'none',
        retry: 'never',
      },
    } as const;
    const startedAt = yield* Clock.currentTimeMillis;
    const timeoutMs = options.timeoutMs ?? 8_000;
    const result = yield* requestEffect(
      buildActionRequestIntent('register', actions.register, {
        username: createAnonymousUsername(deviceId),
      }),
    ).pipe(
      Effect.provideService(Call, {
        identifier: 'register_anonimous',
        actions,
        execution,
        input: {},
        config,
        identity: Object.freeze({ ...snapshot, state: Object.freeze(state) }),
        startedAt,
        checkTokenUses: Ref.makeUnsafe(0),
        deadlineAt: timeoutMs > 0 ? startedAt + timeoutMs : undefined,
        policy: { read: false, upload: false },
      }),
    );
    const cookie = cookieToJson(result.cookie.join('; '));
    if (!cookie.MUSIC_A) {
      return yield* ResponseDecodeFailed.make({
        message: 'Anonymous registration did not return MUSIC_A',
      });
    }
    return { anonymousToken: String(cookie.MUSIC_A), cnIp, deviceId };
  });

export const ensureAnonymousEffect = (
  options: ModuleCallConfig = {},
  execution?: InternalExecution,
): Effect.Effect<string, RequestError, ProcessServices> =>
  Effect.gen(function* () {
    const process = yield* ProcessServices;
    const runtime = process.readState();
    const token = runtime.anonymousToken;
    if (token) {
      return token;
    }
    const key = options.fetcher ?? sharedRegistrationKey;
    let registration = registrations.get(key);
    if (!registration) {
      registration = new ReadStore<string, RequestError>(null);
      registrations.set(key, registration);
    }
    const snapshot = resolveIdentitySnapshot(options, {
      ...runtime,
      deviceId: isDeviceId(options.deviceId)
        ? options.deviceId
        : runtime.deviceId,
    });
    return yield* registration.run(
      snapshot.state.deviceId,
      registerAnonymousEffect(
        { ...options, state: snapshot.state, timeoutMs: 0 },
        execution,
      ).pipe(
        Effect.tap((value) => Effect.sync(() => setRuntimeState(value))),
        Effect.map((value) => value.anonymousToken),
      ),
    );
  });

export const registerAnonymousToken = (
  options: ModuleCallConfig & {
    readonly cnIp?: string;
  } = {},
): Promise<AnonymousRegistration> =>
  runPublicEffect(registerAnonymousEffect(options), options.signal);

export const ensureRuntimeAnonymousToken = (
  options: EnsureAnonymousTokenOptions = {},
): Promise<string> => {
  const timeoutMs = options.timeoutMs ?? 8_000;
  const work = ensureAnonymousEffect(options).pipe(
    Effect.provideService(ProcessServices, resolveProcessServices()),
  );
  return runPublicEffect(
    timeoutMs > 0
      ? work.pipe(
          Effect.timeoutOrElse({
            duration: timeoutMs,
            orElse: () =>
              Effect.fail(
                DeadlineExceeded.make({ message: 'Request timed out' }),
              ),
          }),
        )
      : work,
    options.signal,
  );
};
