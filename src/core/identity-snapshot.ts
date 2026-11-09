import { createHash } from 'node:crypto';

import type {
  CookieRecord,
  ModuleCallConfig,
  RuntimeState,
} from '../types/index.ts';
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

export const isDeviceId = (value: unknown): value is string =>
  typeof value === 'string' &&
  value.length > 0 &&
  !/\s/.test(value) &&
  Array.from(value).every(
    (character) =>
      character.charCodeAt(0) > 31 && character.charCodeAt(0) !== 127,
  );

export const resolveIdentitySnapshot = (
  config: ModuleCallConfig,
  state: RuntimeState,
): IdentitySnapshot => {
  const cookie = resolveRequestCookie(config);
  const runtime = { ...state, ...config.state };
  const deviceId =
    [config.state?.deviceId, cookie.deviceId, state.deviceId].find(
      isDeviceId,
    ) ?? state.deviceId;
  const hadDeviceId = Object.keys(cookie).some(
    (name) => name.toLowerCase() === 'deviceid',
  );
  for (const name of Object.keys(cookie)) {
    if (name.toLowerCase() === 'deviceid') delete cookie[name];
  }
  if (hadDeviceId) cookie.deviceId = deviceId;
  const source = cookie.MUSIC_U
    ? 'cookie-user'
    : cookie.MUSIC_A
      ? 'cookie-anonymous'
      : runtime.anonymousToken
        ? 'runtime-anonymous'
        : 'device';
  const value =
    cookie.MUSIC_U || cookie.MUSIC_A || runtime.anonymousToken || deviceId;
  if (!cookie.MUSIC_U && !cookie.MUSIC_A && runtime.anonymousToken) {
    cookie.MUSIC_A = runtime.anonymousToken;
  }
  return Object.freeze({
    cookie: Object.freeze(cookie),
    state: Object.freeze({ ...runtime, deviceId }),
    fingerprint: createHash('sha256')
      .update(JSON.stringify([value, deviceId]))
      .digest('hex'),
    source,
  });
};
