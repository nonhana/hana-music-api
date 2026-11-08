import type { CookieRecord, RequestProtocol } from '../types/index.ts';
import { OS_PROFILES, USER_AGENT_MAP } from './config.ts';

export interface RequestProfile {
  readonly protocol: RequestProtocol;
  readonly domain: string;
  readonly userAgent: string;
  readonly cookie: Readonly<CookieRecord>;
  readonly omitCookies: ReadonlyArray<string>;
  readonly encryptResponse: boolean;
  readonly acceptGzip: boolean;
  readonly allowedHostSuffixes?: ReadonlyArray<string>;
}

const identityCookieFields = [
  'os',
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
] as const;

export const requestProfiles = {
  // 显式低层 api/linuxapi 的默认身份不参与内置模块的策略选择。
  api: {
    protocol: 'api',
    domain: 'https://interface.music.163.com',
    userAgent: USER_AGENT_MAP.api.iphone,
    cookie: OS_PROFILES.iphone,
    omitCookies: identityCookieFields,
    encryptResponse: false,
    acceptGzip: false,
  },
  linuxapi: {
    protocol: 'linuxapi',
    domain: 'https://music.163.com',
    userAgent: USER_AGENT_MAP.linuxapi.linux,
    cookie: OS_PROFILES.linux,
    omitCookies: identityCookieFields,
    encryptResponse: false,
    acceptGzip: false,
  },
  // #122 以原 scrobble 的 macOS 15.5 字段投影既有浏览器 UA，保留 clientlog 与 App 版本。
  clientlogOsx: {
    protocol: 'eapi',
    domain: 'https://clientlog.music.163.com',
    userAgent: USER_AGENT_MAP.weapi.pc.replace('10_15_7', '15_5'),
    cookie: {
      appver: '3.1.10.5100',
      channel: 'netease',
      os: 'osx',
      osver: '15.5',
    },
    omitCookies: identityCookieFields,
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
    cookie: OS_PROFILES.iphone,
    omitCookies: identityCookieFields,
    encryptResponse: false,
    acceptGzip: false,
  },
  // web 只带浏览器身份；桌面或移动端字段不能从调用者 Cookie 中回流。
  web: {
    protocol: 'weapi',
    domain: 'https://music.163.com',
    userAgent: USER_AGENT_MAP.weapi.pc,
    cookie: { os: 'web' },
    omitCookies: identityCookieFields,
    encryptResponse: false,
    acceptGzip: false,
  },
} as const satisfies Readonly<Record<string, RequestProfile>>;

export type RequestProfileName = keyof typeof requestProfiles;

for (const profile of Object.values(requestProfiles)) {
  Object.freeze(profile.cookie);
  Object.freeze(profile.omitCookies);
  if ('allowedHostSuffixes' in profile)
    Object.freeze(profile.allowedHostSuffixes);
  Object.freeze(profile);
}
Object.freeze(requestProfiles);
