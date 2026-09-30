import { createHash } from 'node:crypto';

import { Clock, Effect } from 'effect';

import type { ModuleCallConfig } from '../types/index.ts';
import { Call } from './call.ts';
import type { RequestError } from './errors.ts';
import { DeadlineExceeded, ResponseDecodeFailed } from './errors.ts';
import { resolveIdentitySnapshot } from './identity.ts';
import { ReadStore } from './read-store.ts';
import { requestEffect } from './request.ts';
import {
  createProcessLayer,
  ProcessServices,
  runPublicEffect,
  setRuntimeState,
} from './runtime.ts';
import type { RequestRuntime } from './runtime.ts';
import {
  cookieToJson,
  generateDeviceId,
  generateRandomChineseIP,
} from './utils.ts';

const ID_XOR_KEY = '3go8&$8*3*3h0k(2)2';

export interface AnonymousRegistration {
  readonly anonymousToken: string;
  readonly cnIp: string;
  readonly deviceId: string;
}

export interface EnsureAnonymousTokenOptions extends ModuleCallConfig {}

const registrations = new WeakMap<object, ReadStore<string, RequestError>>();

const createAnonymousUsername = (deviceId: string): string => {
  let xored = '';
  for (let index = 0; index < deviceId.length; index += 1) {
    xored += String.fromCharCode(
      deviceId.charCodeAt(index) ^
        ID_XOR_KEY.charCodeAt(index % ID_XOR_KEY.length),
    );
  }
  const digest = createHash('md5').update(xored, 'utf8').digest('base64');

  return Buffer.from(`${deviceId} ${digest}`, 'utf8').toString('base64');
};

export const registerAnonymousEffect = (
  options: ModuleCallConfig & {
    readonly cnIp?: string;
    readonly deviceId?: string;
  } = {},
): Effect.Effect<AnonymousRegistration, RequestError, ProcessServices> => {
  return Effect.gen(function* () {
    const deviceId = options.deviceId ?? generateDeviceId();
    const cnIp = options.cnIp ?? generateRandomChineseIP();
    const state = { anonymousToken: '', cnIp, deviceId };
    const config = { ...options, crypto: 'weapi' as const, ip: cnIp, state };
    const startedAt = yield* Clock.currentTimeMillis;
    const timeoutMs = options.timeoutMs ?? 8_000;
    const result = yield* requestEffect({
      target: '/api/register/anonimous',
      protocol: 'weapi',
      method: 'POST',
      headers: {},
      body: JSON.stringify({ username: createAnonymousUsername(deviceId) }),
      response: 'json',
      semantic: 'login',
    }).pipe(
      Effect.provideService(Call, {
        identifier: 'register_anonimous',
        input: {},
        config,
        identity: resolveIdentitySnapshot(config, state),
        startedAt,
        deadlineAt: timeoutMs > 0 ? startedAt + timeoutMs : undefined,
        policy: { read: false, upload: false },
      }),
    );
    const cookie = cookieToJson(result.cookie.join('; '));
    if (!cookie.MUSIC_A) {
      return yield* Effect.fail(
        new ResponseDecodeFailed({
          message: 'Anonymous registration did not return MUSIC_A',
        }),
      );
    }
    return { anonymousToken: String(cookie.MUSIC_A), cnIp, deviceId };
  });
};

export const ensureAnonymousEffect = (
  options: ModuleCallConfig = {},
): Effect.Effect<string, RequestError, ProcessServices> => {
  return Effect.gen(function* () {
    const process = yield* ProcessServices;
    const token = process.readState().anonymousToken;
    if (token) {
      return token;
    }
    const key = options.fetcher ?? process.governor;
    let registration = registrations.get(key);
    if (!registration) {
      registration = new ReadStore<string, RequestError>(null);
      registrations.set(key, registration);
    }
    return yield* registration.run(
      'anonymous',
      registerAnonymousEffect({ ...options, timeoutMs: 0 }).pipe(
        Effect.tap((value) => Effect.sync(() => setRuntimeState(value))),
        Effect.map((value) => value.anonymousToken),
        Effect.provideService(ProcessServices, process),
      ),
    );
  });
};

export const registerAnonymousToken = (
  options: ModuleCallConfig & {
    readonly cnIp?: string;
    readonly deviceId?: string;
  } = {},
  runtime?: RequestRuntime,
): Promise<AnonymousRegistration> => {
  return runPublicEffect(
    registerAnonymousEffect(options).pipe(
      Effect.provide(createProcessLayer(runtime)),
    ),
    options.signal,
  );
};

export const ensureRuntimeAnonymousToken = (
  options: EnsureAnonymousTokenOptions = {},
  runtime?: RequestRuntime,
): Promise<string> => {
  const timeoutMs = options.timeoutMs ?? 8_000;
  const work = ensureAnonymousEffect(options).pipe(
    Effect.provide(createProcessLayer(runtime)),
  );
  return runPublicEffect(
    timeoutMs > 0
      ? work.pipe(
          Effect.timeoutOrElse({
            duration: timeoutMs,
            orElse: () =>
              Effect.fail(
                new DeadlineExceeded({ message: 'Request timed out' }),
              ),
          }),
        )
      : work,
    options.signal,
  );
};
