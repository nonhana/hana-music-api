import { Effect } from 'effect';

import { buildCallServices, runCall } from '../core/call.ts';
import { requestSemantic } from '../core/endpoint-policy.ts';
import { createOption } from '../core/options.ts';
import { requestEffect } from '../core/request.ts';
import { cookieToJson, isCookieRecord, isRecord } from '../core/utils.ts';
import { decodeLegacyModuleInput } from '../modules/_input.ts';
import { RequestBodyError } from '../server/parse-body.ts';
import type {
  CookieRecord,
  ModuleQuery,
  NcmApiResponse,
  RequestCapability,
  RequestCrypto,
} from '../types/index.ts';
import type { DynamicJsonRecord } from '../types/upstream.ts';

export interface ApiDebugRequestPayload extends ModuleQuery {
  crypto?: unknown;
  data?: DynamicJsonRecord | string;
  uri?: unknown;
}

export const invokeApiDebugRequest = async (
  payload: ApiDebugRequestPayload,
  request: RequestCapability = requestEffect,
  fallbackCookie: CookieRecord = {},
  services = buildCallServices(undefined, {}, false),
  signal?: AbortSignal,
  ip?: string,
): Promise<NcmApiResponse> => {
  const uri = typeof payload.uri === 'string' ? payload.uri : '';
  if (
    !/^\/api\/[a-zA-Z0-9/_-]+$/.test(uri) ||
    (payload.crypto !== undefined &&
      (typeof payload.crypto !== 'string' ||
        !['', 'api', 'eapi', 'weapi', 'linuxapi'].includes(payload.crypto)))
  ) {
    throw new RequestBodyError(400, 'Invalid debug URI or crypto');
  }
  const data = readDynamicJsonRecord(payload.data);
  const cookie = readEffectiveCookie(payload.cookie, data, fallbackCookie);
  const crypto = readRequestCrypto(payload.crypto);

  return runCall(
    {
      identifier: 'debug',
      input: {},
      config: createOption({ ...payload, cookie, crypto, ip }, crypto),
      signal,
    },
    services,
    {
      identifier: 'debug',
      route: '/demo/api-debug/request',
      decodeInput: decodeLegacyModuleInput,
      execute: (_input, capability) =>
        capability({
          target: uri,
          body: JSON.stringify(data),
          protocol: crypto || 'api',
          method: 'POST',
          headers: {},
          response: 'json',
          semantic: requestSemantic(uri),
        }).pipe(
          Effect.map((response) => ({
            ...response,
            cookie: [...response.cookie],
          })),
        ),
    },
    request,
  );
};

const readDynamicJsonRecord = (value: unknown): DynamicJsonRecord => {
  try {
    const parsed = typeof value === 'string' ? JSON.parse(value) : value;
    return isRecord(parsed) ? parsed : {};
  } catch {
    return {};
  }
};

const readEffectiveCookie = (
  cookie: ModuleQuery['cookie'],
  data: DynamicJsonRecord,
  fallbackCookie: CookieRecord,
): CookieRecord => {
  const normalizedTopLevelCookie = normalizeCookieRecord(cookie);
  const normalizedBodyCookie = normalizeCookieRecord(data.cookie);

  if (normalizedBodyCookie) {
    data.cookie = normalizedBodyCookie;
    return normalizedBodyCookie;
  }

  if (normalizedTopLevelCookie) {
    return normalizedTopLevelCookie;
  }

  return fallbackCookie;
};

const normalizeCookieRecord = (value: unknown): CookieRecord | null => {
  if (typeof value === 'string') {
    return cookieToJson(value);
  }

  return isCookieRecord(value) ? value : null;
};

const readRequestCrypto = (value: unknown): RequestCrypto => {
  if (
    value === '' ||
    value === 'api' ||
    value === 'eapi' ||
    value === 'linuxapi' ||
    value === 'weapi'
  ) {
    return value;
  }

  return '';
};
