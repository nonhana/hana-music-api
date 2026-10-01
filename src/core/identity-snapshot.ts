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
