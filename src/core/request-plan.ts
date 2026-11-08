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
import { requestProfiles } from './request-profiles.ts';
import type { RequestProfile } from './request-profiles.ts';
import { cookieObjToString, toBoolean } from './utils.ts';

type RequestPayload = Record<string, unknown>;

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
  cookieOverrides: CookieRecord = {},
  profile?: RequestProfile,
  checkToken?: string,
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
  const crypto = resolveCrypto(options.crypto);
  const rawCookie = { ...identity.cookie, ...cookieOverrides };
  const rawOs = profile ? undefined : rawCookie.os;
  const client =
    profile ??
    (rawOs === 'pc'
      ? {
          cookie: OS_PROFILES.pc,
          userAgent: USER_AGENT_MAP.weapi.pc.replace(
            'Macintosh; Intel Mac OS X 10_15_7',
            'Windows NT 10.0; Win64; x64',
          ),
        }
      : rawOs === 'android'
        ? {
            cookie: OS_PROFILES.android,
            userAgent: USER_AGENT_MAP.weapi.pc
              .replace('Macintosh; Intel Mac OS X 10_15_7', 'Linux; Android 14')
              .replace('Safari/537.36 Edg/124.0.0.0', 'Mobile Safari/537.36'),
          }
        : rawOs === 'linux' || (rawOs === undefined && crypto === 'linuxapi')
          ? {
              cookie: OS_PROFILES.linux,
              userAgent: USER_AGENT_MAP.linuxapi.linux,
            }
          : rawOs === 'osx'
            ? requestProfiles.clientlogOsx
            : rawOs === 'web' || (rawOs === undefined && crypto === 'weapi')
              ? requestProfiles.web
              : rawOs === undefined ||
                  rawOs === 'iphone' ||
                  rawOs === 'iPhone OS'
                ? requestProfiles.eapi
                : { cookie: {}, userAgent: '' });
  const userAgent = options.ua || client.userAgent;
  if (userAgent) headers['User-Agent'] = userAgent;
  const cookie = processCookieObject(
    rawCookie,
    uri,
    state,
    entropy,
    client.cookie,
  );
  if (profile) {
    const controlled = new Set(
      [...profile.omitCookies, ...Object.keys(profile.cookie)].map((name) =>
        name.toLowerCase(),
      ),
    );
    for (const name of Object.keys(cookie)) {
      if (controlled.has(name.toLowerCase())) delete cookie[name];
    }
    Object.assign(cookie, profile.cookie);
  }
  headers.Cookie = cookieObjToString(cookie);

  const csrfToken = String(cookie['__csrf'] ?? '');
  const payload = {
    ...data,
  };
  if (checkToken !== undefined) {
    payload.checkToken = checkToken;
    headers['X-antiCheatToken'] = checkToken;
  }
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

  // `''` 在 resolveCrypto 已被折叠成 'eapi'/'api'，这里显式处理以满足穷尽性检查。
  const resolvedCrypto = resolveCrypto(crypto);
  switch (resolvedCrypto) {
    case 'weapi': {
      headers.Referer = options.domain || APP_CONF.domain;
      payload.csrf_token = csrfToken;
      requestBody = weapi(payload, entropy.weapiSecret);
      url = `${options.domain || APP_CONF.domain}/weapi/${uri.slice(5)}`;
      break;
    }

    case 'linuxapi': {
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
      const header = createEapiHeader(cookie, csrfToken, entropy);
      headers.Cookie = createHeaderCookie(header);

      if (resolvedCrypto === 'eapi') {
        if (checkToken !== undefined) header['X-antiCheatToken'] = checkToken;
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
      throw InvalidRequest.make({
        message: `Unknown crypto mode: ${String(resolvedCrypto)}`,
      });
    }
  }

  return {
    url,
    protocol: resolvedCrypto,
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
const resolveCrypto = (
  crypto: RequestCrypto | undefined,
): 'api' | 'eapi' | 'linuxapi' | 'weapi' => {
  if (crypto) {
    return crypto;
  }

  return APP_CONF.encrypt ? 'eapi' : 'api';
};

const processCookieObject = (
  cookie: CookieRecord,
  uri: string,
  state: RuntimeState,
  entropy: RequestEntropy,
  defaults: Readonly<CookieRecord>,
): CookieRecord => {
  const randomNuid = entropy.nuid;
  const processedCookie: CookieRecord = {
    ...defaults,
    ...cookie,
    __remember_me: 'true',
    _ntes_nnid: String(cookie['_ntes_nnid'] ?? `${randomNuid},${entropy.now}`),
    _ntes_nuid: String(cookie['_ntes_nuid'] ?? randomNuid),
    WEVNSM: String(cookie.WEVNSM ?? '1.0.0'),
    WNMCID: String(cookie.WNMCID ?? entropy.wnmcid),
    deviceId: state.deviceId,
    ntes_kaola_ad: '1',
  };

  if (!uri.includes('login')) {
    processedCookie.NMTID = entropy.nmtid;
  }

  return processedCookie;
};

const createHeaderCookie = (header: Record<string, string>): string =>
  Object.entries(header)
    .map(
      ([key, value]) =>
        `${encodeURIComponent(key)}=${encodeURIComponent(value)}`,
    )
    .join('; ');

const createEapiHeader = (
  cookie: CookieRecord,
  csrfToken: string,
  entropy: RequestEntropy,
): Record<string, string> => {
  const header: Record<string, string> = {
    __csrf: csrfToken,
    deviceId: String(cookie.deviceId ?? ''),
    requestId: entropy.requestId,
  };

  for (const name of [
    'appver',
    'buildver',
    'channel',
    'mobilename',
    'os',
    'osver',
    'resolution',
    'versioncode',
  ]) {
    if (cookie[name] !== undefined) header[name] = String(cookie[name]);
  }

  if (cookie.MUSIC_A) {
    header.MUSIC_A = String(cookie.MUSIC_A);
  }

  if (cookie.MUSIC_U) {
    header.MUSIC_U = String(cookie.MUSIC_U);
  }

  return header;
};

const stringifyPayload = (payload: RequestPayload): Record<string, string> =>
  Object.fromEntries(
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
