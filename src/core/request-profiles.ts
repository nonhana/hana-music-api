import type { CookieRecord, RequestIntent } from '../types/index.ts';
import { OS_PROFILES, USER_AGENT_MAP } from './config.ts';

export interface RequestProfile {
  readonly protocol: RequestIntent['protocol'];
  readonly domain: string;
  readonly userAgent: string;
  readonly cookie: Readonly<CookieRecord>;
  readonly omitCookies: ReadonlyArray<string>;
  readonly encryptResponse: boolean;
  readonly acceptGzip: boolean;
}

export const requestProfiles = {
  eapi: {
    protocol: 'eapi',
    domain: 'https://interface.music.163.com',
    userAgent: USER_AGENT_MAP.api.iphone,
    cookie: OS_PROFILES.pc,
    omitCookies: [],
    encryptResponse: false,
    acceptGzip: false,
  },
  // web 只带浏览器身份；桌面或移动端字段不能从调用者 Cookie 中回流。
  web: {
    protocol: 'weapi',
    domain: 'https://music.163.com',
    userAgent: USER_AGENT_MAP.weapi.pc,
    cookie: { os: 'web' },
    omitCookies: [
      'appver',
      'channel',
      'osver',
      'clientSign',
      'buildver',
      'mobilename',
      'versioncode',
      'resolution',
      'brand',
      'mode',
    ],
    encryptResponse: false,
    acceptGzip: false,
  },
} as const satisfies Readonly<Record<string, RequestProfile>>;

export type RequestProfileName = keyof typeof requestProfiles;
