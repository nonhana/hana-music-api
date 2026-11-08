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
  readonly allowedHostSuffixes?: ReadonlyArray<string>;
}

export const requestProfiles = {
  // ea108c8 的两条日志保持 clientlog 域名和 osx Cookie，不套用普通 eapi 身份。
  clientlogOsx: {
    protocol: 'eapi',
    domain: 'https://clientlog.music.163.com',
    userAgent: USER_AGENT_MAP.api.iphone,
    cookie: {
      appver: '3.1.10.5100',
      channel: 'netease',
      os: 'osx',
      osver: '15.5',
    },
    omitCookies: [],
    encryptResponse: false,
    acceptGzip: false,
  },
  // ea108c8 的 plain 阶段没有显式 UA/Cookie；各域名和原始响应模式按固定基线保留。
  plainInterface: {
    protocol: 'plain',
    domain: 'https://interface.music.163.com',
    userAgent: '',
    cookie: {},
    omitCookies: [],
    encryptResponse: false,
    acceptGzip: false,
  },
  plainMusic: {
    protocol: 'plain',
    domain: 'https://music.163.com',
    userAgent: '',
    cookie: {},
    omitCookies: [],
    encryptResponse: false,
    acceptGzip: false,
  },
  plainImage: {
    protocol: 'plain',
    domain: 'https://nosup-hz1.127.net',
    userAgent: '',
    cookie: {},
    omitCookies: [],
    encryptResponse: false,
    acceptGzip: false,
  },
  plainLookup: {
    protocol: 'plain',
    domain: 'https://wanproxy.127.net',
    userAgent: '',
    cookie: {},
    omitCookies: [],
    encryptResponse: false,
    acceptGzip: false,
  },
  plainNos: {
    protocol: 'plain',
    domain: 'https://nosup-hz1.127.net',
    userAgent: '',
    cookie: {},
    omitCookies: [],
    encryptResponse: false,
    acceptGzip: false,
    allowedHostSuffixes: ['.127.net', '.163yun.com'],
  },
  plainVoice: {
    protocol: 'plain',
    domain: 'https://ymusic.nos-hz.163yun.com',
    userAgent: '',
    cookie: {},
    omitCookies: [],
    encryptResponse: false,
    acceptGzip: false,
  },

  eapi: {
    protocol: 'eapi',
    domain: 'https://interface.music.163.com',
    userAgent: USER_AGENT_MAP.api.iphone,
    cookie: OS_PROFILES.pc,
    omitCookies: [],
    encryptResponse: false,
    acceptGzip: false,
  },
  // c2c8fa1 的曲库模块实际组合 weapi、浏览器 UA 和 PC Cookie；不把它改成 web 身份。
  weapiPc: {
    protocol: 'weapi',
    domain: 'https://music.163.com',
    userAgent: USER_AGENT_MAP.weapi.pc,
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
