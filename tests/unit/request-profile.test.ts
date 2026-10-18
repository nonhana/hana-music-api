import { expect, test } from 'bun:test';

import { aesDecrypt, eapiReqDecrypt } from '../../src/core/crypto.ts';
import { InvalidRequest } from '../../src/core/errors.ts';
import type { IdentitySnapshot } from '../../src/core/identity.ts';
import type { RequestEntropy } from '../../src/core/request-plan.ts';
import { prepareRequest } from '../../src/core/request-plan.ts';
import { REQUEST_PROFILES } from '../../src/core/request-profile.ts';
import type { CookieRecord } from '../../src/types/index.ts';

const secret = '0123456789abcdef';
const iv = '0102030405060708';
const presetKey = '0CoJUm6Qyw8W8jud';

const entropy: RequestEntropy = {
  now: 1_700_000_000_000,
  nuid: 'nuid',
  nmtid: 'nmtid',
  wnmcid: 'wnmcid',
  requestId: 'request-id',
  weapiSecret: secret,
};

const identity = (cookie: CookieRecord): IdentitySnapshot => ({
  cookie,
  state: {
    anonymousToken: '',
    cnIp: '127.0.0.1',
    deviceId: 'runtime-device',
  },
  fingerprint: 'fingerprint',
  source: 'cookie-user',
});

const decryptWeapi = (params: string): Record<string, unknown> => {
  const outer = aesDecrypt(params, 'cbc', secret, iv).toString('utf8');
  const inner = aesDecrypt(outer, 'cbc', presetKey, iv).toString('utf8');
  return JSON.parse(inner) as Record<string, unknown>;
};

test('web profile fixes protocol, UA, cookie identity and token placement', () => {
  const plan = prepareRequest({
    uri: '/api/playlist/create',
    data: { name: 'demo' },
    options: {
      crypto: 'eapi',
      headers: {
        'X-antiCheatToken': 'forged',
        'X-Test': 'kept',
      },
      ua: 'caller-agent',
    },
    identity: identity({
      MUSIC_U: 'listener',
      os: 'iphone',
      appver: '9.0.90',
      osver: '16.2',
      channel: 'distribution',
      deviceId: 'caller-device',
      buildver: '3330',
      mobilename: 'Mac15,6',
      resolution: '2560x1440',
      versioncode: '140',
    }),
    entropy,
    profile: REQUEST_PROFILES.web,
    checkToken: 'fresh-token',
  });

  expect(plan.protocol).toBe('weapi');
  expect(plan.url).toBe('https://music.163.com/weapi/playlist/create');
  expect(plan.headers['User-Agent']).toBe(REQUEST_PROFILES.web.userAgent);
  expect(plan.headers['X-Test']).toBe('kept');
  expect(plan.headers['X-antiCheatToken']).toBe('fresh-token');
  const cookie = plan.headers.Cookie ?? '';
  expect(cookie).toContain('os=web');
  expect(cookie).toContain('MUSIC_U=listener');
  expect(cookie).not.toContain('appver=');
  expect(cookie).not.toContain('osver=');
  expect(cookie).not.toContain('channel=');
  expect(cookie).not.toContain('deviceId=');
  expect(cookie).not.toContain('buildver=');
  expect(cookie).not.toContain('mobilename=');
  expect(cookie).not.toContain('resolution=');
  expect(cookie).not.toContain('versioncode=');
  const params = new URLSearchParams(String(plan.body)).get('params');
  expect(params).toBeTruthy();
  expect(decryptWeapi(params ?? '')).toMatchObject({
    checkToken: 'fresh-token',
    e_r: false,
    name: 'demo',
  });
});

test('desktop profile places token in eapi body, encrypted header and HTTP header', () => {
  const plan = prepareRequest({
    uri: '/api/playlist/subscribe',
    data: { id: 1 },
    options: { crypto: 'weapi', ua: 'caller-agent' },
    identity: identity({ MUSIC_U: 'listener', os: 'pc' }),
    entropy,
    profile: REQUEST_PROFILES.desktop,
    checkToken: 'desktop-token',
  });

  expect(plan.protocol).toBe('eapi');
  expect(plan.url).toBe(
    'https://interface.music.163.com/eapi/playlist/subscribe',
  );
  expect(plan.headers['x-anticheattoken']).toBe('desktop-token');
  expect(plan.headers.Cookie).not.toContain('desktop-token');
  const params = new URLSearchParams(String(plan.body)).get('params');
  expect(params).toBeTruthy();
  const decoded = eapiReqDecrypt(params ?? '');
  expect(decoded?.data.checkToken).toBe('desktop-token');
  const header = decoded?.data.header as Record<string, unknown> | undefined;
  expect(header?.['X-antiCheatToken']).toBe('desktop-token');
});

test('checkToken is rejected for protocols that cannot carry it', () => {
  expect(() =>
    prepareRequest({
      uri: '/api/playlist/create',
      data: {},
      options: { crypto: 'linuxapi' },
      identity: identity({ MUSIC_U: 'listener' }),
      entropy,
      checkToken: 'token',
    }),
  ).toThrow(InvalidRequest);
});
