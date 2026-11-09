import { buildCallServices } from '../core/call.ts';
import { createOption } from '../core/options.ts';
import { runRequestAtEdge, snapshotRequestData } from '../core/request.ts';
import { cookieToJson, isCookieRecord, isRecord } from '../core/utils.ts';
import { RequestBodyError } from '../server/parse-body.ts';
import type {
  CookieRecord,
  ModuleQuery,
  NcmApiResponse,
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
  fallbackCookie: CookieRecord = {},
  services = buildCallServices({}, false),
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

  const response = await runRequestAtEdge(
    {
      target: uri,
      data: snapshotRequestData(data),
      protocol: crypto || 'api',
      method: 'POST',
      headers: {},
      response: 'json',
    },
    { ...createOption({ ...payload, cookie, crypto, ip }, crypto), signal },
    services.execution,
  );
  return {
    status: response.status,
    cookie: [...response.cookie],
    body: response.body,
  };
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
