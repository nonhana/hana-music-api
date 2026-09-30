import type {
  CookieRecord,
  CreateRequestOptions,
  RequestCrypto,
  RequestIntent,
  RuntimeState,
} from '../types/index.ts';
import { APP_CONF, OS_PROFILES, USER_AGENT_MAP } from './config.ts';
import { eapi, linuxapi, weapi } from './crypto.ts';
import { InvalidRequest } from './errors.ts';
import type { IdentitySnapshot } from './identity.ts';
import { cookieObjToString, toBoolean } from './utils.ts';

type RequestPayload = Record<string, unknown>;
type UserAgentCrypto = 'api' | 'linuxapi' | 'weapi';
type OsProfileKey = keyof typeof OS_PROFILES;

export interface RequestEntropy {
  readonly now: number;
  readonly nuid: string;
  readonly nmtid: string;
  readonly wnmcid: string;
  readonly requestId: string;
  readonly weapiSecret: string;
}

export interface RequestPlan {
  readonly url: string;
  readonly headers: Readonly<Record<string, string>>;
  readonly body?: string | Uint8Array;
  readonly identity: string;
  readonly protocol: RequestIntent['protocol'];
  readonly method: string;
  readonly encryptResponse: boolean;
}

export const prepareRequest = (
  uri: string,
  data: RequestPayload,
  options: CreateRequestOptions,
  identity: IdentitySnapshot,
  entropy: RequestEntropy,
): RequestPlan => {
  const state = identity.state;
  const headers: Record<string, string> = {};
  for (const [name, value] of Object.entries(options.headers ?? {})) {
    if (name.toLowerCase() !== 'cookie') {
      headers[name] = value;
    }
  }
  // 调用方未显式给 ip/realIP 时回退到进程级 cnIp。SDK 链路据此默认获得中国区伪装 IP,
  // HTTP server 始终显式传 ip,不受影响。
  const ip = options.realIP ?? options.ip ?? state.cnIp;

  if (ip) {
    headers['X-Forwarded-For'] = ip;
    headers['X-Real-IP'] = ip;
  }
  const cookie = processCookieObject(
    { ...identity.cookie },
    uri,
    state,
    entropy,
  );
  headers.Cookie = cookieObjToString(cookie);

  const csrfToken = String(cookie['__csrf'] ?? '');
  const crypto = resolveCrypto(options.crypto);
  const payload = {
    ...data,
  };
  // e_r 决定服务端是否返回加密响应。旧项目对所有 crypto 统一注入该标记,
  // 并对 eapi / weapi 两种加密都做响应解密,这里保持同样语义。
  const encryptResponse = Boolean(
    toBoolean(
      options.e_r !== undefined
        ? options.e_r
        : (readBooleanLike(payload.e_r) ?? APP_CONF.encryptResponse),
    ),
  );
  payload.e_r = encryptResponse;

  let url = '';
  let requestBody: Record<string, string>;

  switch (crypto) {
    case 'weapi': {
      headers.Referer = options.domain || APP_CONF.domain;
      headers['User-Agent'] = options.ua || chooseUserAgent('weapi', 'pc');
      payload.csrf_token = csrfToken;
      requestBody = weapi(payload, entropy.weapiSecret);
      url = `${options.domain || APP_CONF.domain}/weapi/${uri.slice(5)}`;
      break;
    }

    case 'linuxapi': {
      headers['User-Agent'] =
        options.ua || chooseUserAgent('linuxapi', 'linux');
      requestBody = linuxapi({
        method: 'POST',
        params: payload,
        url: `${options.domain || APP_CONF.domain}${uri}`,
      });
      url = `${options.domain || APP_CONF.domain}/api/linux/forward`;
      break;
    }

    case 'eapi':
    case 'api': {
      const header = createEapiHeader(cookie, csrfToken, options, entropy);
      headers.Cookie = createHeaderCookie(header);
      headers['User-Agent'] = options.ua || chooseUserAgent('api', 'iphone');

      if (crypto === 'eapi') {
        payload.header = header;
        // 真客户端会以 x-aeapi 声明可接受 gzip 压缩响应;按需开启以省带宽。
        if (options.acceptGzip) {
          headers['x-aeapi'] = 'true';
        }
        requestBody = eapi(uri, payload);
        url = `${options.domain || APP_CONF.apiDomain}/eapi/${uri.slice(5)}`;
      } else {
        requestBody = stringifyPayload(payload);
        url = `${options.domain || APP_CONF.apiDomain}${uri}`;
      }
      break;
    }

    default: {
      throw new InvalidRequest({ message: `Unknown crypto mode: ${crypto}` });
    }
  }

  return {
    url,
    protocol: crypto,
    method: 'POST',
    encryptResponse,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      ...headers,
    },
    body: new URLSearchParams(requestBody).toString(),
    identity: identity.fingerprint,
  };
};
const resolveCrypto = (crypto: RequestCrypto | undefined): RequestCrypto => {
  if (crypto) {
    return crypto;
  }

  return APP_CONF.encrypt ? 'eapi' : 'api';
};

const chooseUserAgent = (
  crypto: UserAgentCrypto,
  uaType: 'android' | 'iphone' | 'linux' | 'pc' = 'pc',
): string => {
  const config = USER_AGENT_MAP[crypto] as Partial<
    Record<'android' | 'iphone' | 'linux' | 'pc', string>
  >;
  if (!config) {
    return '';
  }

  return config[uaType] ?? '';
};

const processCookieObject = (
  cookie: CookieRecord,
  uri: string,
  state: RuntimeState,
  entropy: RequestEntropy,
): CookieRecord => {
  const randomNuid = entropy.nuid;
  const osKey = getOsProfileKey(cookie.os);
  const osProfile = OS_PROFILES[osKey];
  const processedCookie: CookieRecord = {
    ...cookie,
    __remember_me: 'true',
    _ntes_nnid: String(cookie['_ntes_nnid'] ?? `${randomNuid},${entropy.now}`),
    _ntes_nuid: String(cookie['_ntes_nuid'] ?? randomNuid),
    WEVNSM: String(cookie.WEVNSM ?? '1.0.0'),
    WNMCID: String(cookie.WNMCID ?? entropy.wnmcid),
    appver: String(cookie.appver ?? osProfile.appver),
    channel: String(cookie.channel ?? osProfile.channel),
    deviceId: String(cookie.deviceId ?? state.deviceId),
    ntes_kaola_ad: '1',
    os: String(cookie.os ?? osProfile.os),
    osver: String(cookie.osver ?? osProfile.osver),
  };

  if (!uri.includes('login')) {
    processedCookie.NMTID = entropy.nmtid;
  }

  return processedCookie;
};

const createHeaderCookie = (header: Record<string, string>): string => {
  return Object.entries(header)
    .map(([key, value]) => {
      return `${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
    })
    .join('; ');
};

const createEapiHeader = (
  cookie: CookieRecord,
  csrfToken: string,
  options: CreateRequestOptions,
  entropy: RequestEntropy,
): Record<string, string> => {
  const header: Record<string, string> = {
    __csrf: csrfToken,
    appver: String(cookie.appver ?? ''),
    buildver: String(cookie.buildver ?? `${entropy.now}`.slice(0, 10)),
    channel: String(cookie.channel ?? ''),
    deviceId: String(cookie.deviceId ?? ''),
    mobilename: String(cookie.mobilename ?? ''),
    os: String(cookie.os ?? ''),
    osver: String(cookie.osver ?? ''),
    requestId: entropy.requestId,
    resolution: String(cookie.resolution ?? '1920x1080'),
    versioncode: String(cookie.versioncode ?? '140'),
  };

  if (options.checkToken) {
    header['X-antiCheatToken'] = APP_CONF.checkToken;
  }

  if (cookie.MUSIC_A) {
    header.MUSIC_A = String(cookie.MUSIC_A);
  }

  if (cookie.MUSIC_U) {
    header.MUSIC_U = String(cookie.MUSIC_U);
  }

  return header;
};

const stringifyPayload = (payload: RequestPayload): Record<string, string> => {
  return Object.fromEntries(
    Object.entries(payload)
      .filter((entry) => entry[1] !== undefined)
      .map(([key, value]) => {
        if (typeof value === 'string') {
          return [key, value];
        }

        if (typeof value === 'number' || typeof value === 'boolean') {
          return [key, String(value)];
        }

        return [key, JSON.stringify(value)];
      }),
  );
};

const readBooleanLike = (
  value: unknown,
): boolean | number | string | undefined => {
  if (
    typeof value === 'boolean' ||
    typeof value === 'number' ||
    typeof value === 'string'
  ) {
    return value;
  }

  return undefined;
};

const getOsProfileKey = (value: CookieRecord['os']): OsProfileKey => {
  if (
    value === 'android' ||
    value === 'iphone' ||
    value === 'linux' ||
    value === 'pc'
  ) {
    return value;
  }

  return 'pc';
};
