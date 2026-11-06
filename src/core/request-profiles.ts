import type { CookieRecord, RequestIntent } from '../types/index.ts';
import { USER_AGENT_MAP } from './config.ts';

export interface RequestProfile {
  readonly protocol: RequestIntent['protocol'];
  readonly domain: string;
  readonly userAgent: string;
  readonly cookie: Readonly<CookieRecord>;
  readonly omitCookies: ReadonlyArray<string>;
  readonly encryptResponse: boolean;
  readonly acceptGzip: boolean;
  readonly tokenPlacement: 'none' | 'web';
}

// web 只带浏览器身份；桌面或移动端字段不能从调用者 Cookie 中回流。
export const requestProfiles = {
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
    tokenPlacement: 'web',
  },
} as const satisfies Readonly<Record<string, RequestProfile>>;

export type RequestProfileName = keyof typeof requestProfiles;
