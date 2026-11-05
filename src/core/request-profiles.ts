import type { CookieRecord, RequestIntent } from '../types/index.ts';
import { OS_PROFILES, USER_AGENT_MAP } from './config.ts';

export interface RequestProfile {
  readonly lifecycle: 'verified' | 'transition';
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
    lifecycle: 'verified',
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
  // P2 只接通现有请求策略；PC Cookie 与 iPhone UA 尚无一致身份依据，取得证据后必须替换并删除此过渡项。
  eapiTransition: {
    lifecycle: 'transition',
    protocol: 'eapi',
    domain: 'https://interface.music.163.com',
    userAgent: USER_AGENT_MAP.api.iphone,
    cookie: {
      ...OS_PROFILES.pc,
      mobilename: '',
      resolution: '1920x1080',
      versioncode: '140',
    },
    omitCookies: ['buildver', 'clientSign', 'brand', 'mode'],
    encryptResponse: false,
    acceptGzip: false,
    tokenPlacement: 'none',
  },
} as const satisfies Readonly<Record<string, RequestProfile>>;

export type RequestProfileName = keyof typeof requestProfiles;
