import { Clock, Effect } from 'effect';

import type { ModuleCallConfig } from '../types/index.ts';
import { ExecutionScope, resolveExecutionScope } from './call-context.ts';
import type { InternalExecution } from './call-context.ts';
import type { RequestError } from './errors.ts';
import { DeadlineExceeded, ResponseDecodeFailed } from './errors.ts';
import { resolveIdentitySnapshot } from './identity.ts';
import { ReadStore } from './read-store.ts';
import { requestProfiles } from './request-profiles.ts';
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
      },
    );
    const deviceId = snapshot.state.deviceId;
    const cnIp =
      options.cnIp ?? options.state?.cnIp ?? generateRandomChineseIP();
    const state = { anonymousToken: '', cnIp, deviceId };
    // 隐式身份初始化不消费业务调用的 token；显式注册模块仍使用自己的 token 来源。
    const startedAt = yield* Clock.currentTimeMillis;
    const timeoutMs = options.timeoutMs ?? 8_000;
    const profile = requestProfiles.web;
    const result = yield* requestEffect({
      target: '/api/register/anonimous',
      protocol: 'weapi',
      method: 'POST',
      response: 'json',
      headers: {},
      data: { username: createAnonymousUsername(deviceId) },
      identity: Object.freeze({ ...snapshot, state: Object.freeze(state) }),
      ip: options.realIP ?? cnIp,
      expectedUrl: 'https://music.163.com/weapi/register/anonimous',
      policy: { semantic: 'login', retry: 'never' },
      retry: options.retry,
      token: { source: undefined, uses: undefined, managed: false },
      client: {
        domain: profile.domain,
        userAgent: profile.userAgent,
        cookie: profile.cookie,
        controlledCookies: [
          ...profile.omitCookies,
          ...Object.keys(profile.cookie),
        ],
        controlledHeaders: [],
        encryptResponse: profile.encryptResponse,
        acceptGzip: profile.acceptGzip,
      },
    }).pipe(
      Effect.provideService(
        ExecutionScope,
        resolveExecutionScope(options, execution, startedAt, timeoutMs),
      ),
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
  options: ModuleCallConfig = {},
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
