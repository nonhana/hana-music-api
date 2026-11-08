// cspell:ignore anticheattoken
import type { Ref } from 'effect';

import type {
  BooleanLike,
  CookieRecord,
  ModuleCallConfig,
  RequestProtocol,
  RequestSemantic,
} from '../types/index.ts';
import { eapi, linuxapi, weapi } from './crypto.ts';
import { InvalidRequest } from './errors.ts';
import type { IdentitySnapshot } from './identity.ts';
import { cookieObjToString, isRecord, toBoolean } from './utils.ts';

export type ResolvedRequest = {
  readonly target: string;
  readonly method: string;
  readonly headers: Readonly<Record<string, string>>;
  readonly identity: IdentitySnapshot;
  readonly ip: string | undefined;
  readonly expectedUrl: string | null;
  readonly response: 'json' | 'text' | 'bytes';
  readonly policy: {
    readonly semantic: RequestSemantic;
    readonly retry: 'never' | 'connect' | 'read';
  };
  readonly retry: ModuleCallConfig['retry'];
  readonly token: {
    readonly source: ModuleCallConfig['checkToken'];
    readonly uses: Ref.Ref<number> | undefined;
    readonly managed: boolean;
  };
} & (
  | { readonly protocol: 'plain'; readonly body?: Uint8Array | string }
  | {
      readonly protocol: 'api' | 'weapi' | 'eapi' | 'linuxapi';
      readonly data: unknown;
      readonly client: {
        readonly domain: string;
        readonly userAgent: string;
        readonly cookie: Readonly<CookieRecord>;
        readonly controlledCookies: ReadonlyArray<string>;
        readonly controlledHeaders: ReadonlyArray<string>;
        readonly encryptResponse: BooleanLike | undefined;
        readonly acceptGzip: boolean | undefined;
      };
    }
);

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
  readonly protocol: RequestProtocol;
  readonly method: string;
  readonly encryptResponse: boolean;
}

export const prepareRequest = (
  request: ResolvedRequest,
  entropy: RequestEntropy,
  checkToken?: string,
): RequestPlan => {
  const { target: uri, identity } = request;
  if (request.protocol === 'plain') {
    const headers = { ...request.headers };
    if (request.token.managed) {
      for (const name of Object.keys(headers)) {
        if (name.toLowerCase() === 'x-anticheattoken') delete headers[name];
      }
    }
    if (checkToken !== undefined) headers['X-antiCheatToken'] = checkToken;
    return {
      url: uri,
      headers,
      body: request.body,
      method: request.method,
      protocol: 'plain',
      identity: identity.fingerprint,
      encryptResponse: false,
    };
  }
  const captured = request.data;
  const data = captured === undefined ? {} : captured;
  if (!isRecord(data))
    throw InvalidRequest.make({
      message: 'API request body must be an object',
    });
  const payload = { ...data };
  if (request.token.managed) delete payload.checkToken;
  const headers: Record<string, string> = {};
  const controlledHeaders = new Set(
    request.client.controlledHeaders.map((name) => name.toLowerCase()),
  );
  for (const [name, value] of Object.entries(request.headers)) {
    if (
      name.toLowerCase() === 'cookie' ||
      controlledHeaders.has(name.toLowerCase())
    )
      continue;
    if (controlledHeaders.size) {
      for (const existing of Object.keys(headers)) {
        if (existing.toLowerCase() === name.toLowerCase())
          delete headers[existing];
      }
    }
    headers[name] = value;
  }
  const ip = request.ip;
  if (ip) {
    headers['X-Forwarded-For'] = ip;
    headers['X-Real-IP'] = ip;
  }
  const protocol = request.protocol;
  const client = request.client;
  if (client.userAgent) headers['User-Agent'] = client.userAgent;
  const rawCookie = identity.cookie;
  const cookie: CookieRecord = {
    ...client.cookie,
    ...rawCookie,
    __remember_me: 'true',
    _ntes_nnid: String(
      rawCookie['_ntes_nnid'] ?? `${entropy.nuid},${entropy.now}`,
    ),
    _ntes_nuid: String(rawCookie['_ntes_nuid'] ?? entropy.nuid),
    WEVNSM: String(rawCookie.WEVNSM ?? '1.0.0'),
    WNMCID: String(rawCookie.WNMCID ?? entropy.wnmcid),
    deviceId: identity.state.deviceId,
    ntes_kaola_ad: '1',
  };
  if (!uri.includes('login')) cookie.NMTID = entropy.nmtid;
  if (client.controlledCookies.length) {
    const controlled = new Set(
      client.controlledCookies.map((name) => name.toLowerCase()),
    );
    for (const name of Object.keys(cookie)) {
      if (controlled.has(name.toLowerCase())) delete cookie[name];
    }
    Object.assign(cookie, client.cookie);
  }
  headers.Cookie = cookieObjToString(cookie);

  const csrfToken = String(cookie['__csrf'] ?? '');
  if (checkToken !== undefined) {
    payload.checkToken = checkToken;
    headers['X-antiCheatToken'] = checkToken;
  }
  // e_r 决定服务端是否返回加密响应。旧项目对所有 crypto 统一注入该标记,
  // 并对 eapi / weapi 两种加密都做响应解密,这里保持同样语义。
  let responseFlag = client.encryptResponse;
  if (responseFlag === undefined) {
    const supplied = payload.e_r;
    responseFlag = false;
    if (
      typeof supplied === 'boolean' ||
      typeof supplied === 'number' ||
      typeof supplied === 'string'
    ) {
      responseFlag = supplied;
    }
  }
  const encryptResponse = Boolean(toBoolean(responseFlag));
  payload.e_r = encryptResponse;

  let url = '';
  let requestBody: Record<string, string>;

  switch (protocol) {
    case 'weapi': {
      headers.Referer = client.domain;
      payload.csrf_token = csrfToken;
      requestBody = weapi(payload, entropy.weapiSecret);
      url = `${client.domain}/weapi/${uri.slice(5)}`;
      break;
    }

    case 'linuxapi': {
      requestBody = linuxapi({
        method: 'POST',
        params: payload,
        url: `${client.domain}${uri}`,
      });
      url = `${client.domain}/api/linux/forward`;
      break;
    }

    case 'eapi':
    case 'api': {
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
      if (cookie.MUSIC_A) header.MUSIC_A = String(cookie.MUSIC_A);
      if (cookie.MUSIC_U) header.MUSIC_U = String(cookie.MUSIC_U);
      headers.Cookie = Object.entries(header)
        .map(
          ([key, value]) =>
            `${encodeURIComponent(key)}=${encodeURIComponent(value)}`,
        )
        .join('; ');

      if (protocol === 'eapi') {
        if (checkToken !== undefined) header['X-antiCheatToken'] = checkToken;
        payload.header = header;
        // 真客户端会以 x-aeapi 声明可接受 gzip 压缩响应;按需开启以省带宽。
        if (client.acceptGzip) {
          headers['x-aeapi'] = 'true';
        }
        requestBody = eapi(uri, payload);
        url = `${client.domain}/eapi/${uri.slice(5)}`;
      } else {
        requestBody = Object.fromEntries(
          Object.entries(payload)
            .filter((entry) => entry[1] !== undefined)
            .map(([key, value]) => {
              if (typeof value === 'string') return [key, value];
              if (typeof value === 'number' || typeof value === 'boolean') {
                return [key, String(value)];
              }
              return [key, JSON.stringify(value)];
            }),
        );
        url = `${client.domain}${uri}`;
      }
      break;
    }

    default: {
      throw InvalidRequest.make({
        message: `Unknown crypto mode: ${String(protocol)}`,
      });
    }
  }

  return {
    url,
    protocol,
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
