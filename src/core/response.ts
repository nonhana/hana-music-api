import { Cause } from 'effect';

import type { NcmApiResponse, RequestCrypto } from '../types/index.ts';
import type { UpstreamBody, UpstreamResponse } from '../types/upstream.ts';
import { SPECIAL_STATUS_CODES } from './config.ts';
import { eapiResDecrypt } from './crypto.ts';
import {
  AdmissionRejected,
  DeadlineExceeded,
  InvalidModuleInput,
  InvalidRequest,
  PartialUpload,
  ProtocolFailed,
  TargetRejected,
  UpstreamBusinessFailed,
  UpstreamRateLimited,
} from './errors.ts';
import { isRecord } from './utils.ts';

export interface ConsumedResponse {
  readonly body: Uint8Array;
  readonly headers: Headers;
  readonly setCookies: ReadonlyArray<string>;
  readonly status: number;
}

export interface RateLimitDecision {
  readonly retryAfterMs: number;
}

export const classifyHeaderRateLimit = (
  status: number,
  headers: Headers,
  now: number,
): RateLimitDecision | undefined => {
  return status === 429
    ? { retryAfterMs: retryAfterMs(headers.get('retry-after'), now) }
    : undefined;
};

export const classifyConsumedRateLimit = (
  response: ConsumedResponse,
  value: unknown,
  now: number,
): RateLimitDecision | undefined => {
  const businessLimited = hasBusiness429(response);
  const statusLimited =
    isRecord(value) && 'status' in value && Number(value.status) === 429;
  if (response.status !== 429 && !businessLimited && !statusLimited) {
    return undefined;
  }
  return {
    retryAfterMs: retryAfterMs(response.headers.get('retry-after'), now),
  };
};

export const hasBusiness429 = (response: ConsumedResponse): boolean => {
  try {
    const body: unknown = JSON.parse(new TextDecoder().decode(response.body));
    return isRecord(body) && Number(body.code) === 429;
  } catch {
    return false;
  }
};

export const interpretResponse = (
  response: ConsumedResponse,
  crypto: RequestCrypto,
  encryptResponse: boolean,
  gzip: boolean,
): UpstreamResponse => {
  let parsed: unknown;
  const text = new TextDecoder().decode(response.body);
  try {
    parsed = JSON.parse(text);
  } catch {
    if ((crypto === 'weapi' || crypto === 'eapi') && encryptResponse) {
      parsed = eapiResDecrypt(
        Buffer.from(response.body).toString('hex').toUpperCase(),
        gzip,
      );
      if (parsed === null && response.status !== 429) {
        throw new Error('Invalid encrypted upstream response');
      }
    } else {
      parsed = text;
    }
  }
  const body = normalizeUpstreamBody(parsed);
  const code =
    isRecord(body) && body.code !== undefined
      ? Number(body.code)
      : response.status;
  if (isRecord(body) && body.code !== undefined) {
    body.code = code;
  }
  const status =
    response.status === 429 || code === 429
      ? 429
      : SPECIAL_STATUS_CODES.has(code)
        ? 200
        : code;
  return {
    headers: response.headers,
    body,
    cookie: response.setCookies.map(stripCookieDomain),
    status: status > 100 && status < 600 ? status : 400,
  };
};

export const retryAfterMs = (value: string | null, now: number): number => {
  if (!value) {
    return 30_000;
  }
  const normalized = value.trim();
  if (/^\d+$/.test(normalized)) {
    const seconds = Number(normalized);
    return Math.min(Math.max(seconds * 1_000, 1_000), 300_000);
  }
  const date = Date.parse(
    normalized.endsWith(' GMT') ? normalized : `${normalized} GMT`,
  );
  if (!Number.isFinite(date)) {
    return 30_000;
  }
  const parsed = new Date(date);
  const standard = parsed.toUTCString();
  const weekday = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ][parsed.getUTCDay()];
  const legacy = `${weekday}, ${standard.slice(5, 7)}-${standard.slice(8, 11)}-${standard.slice(14, 16)} ${standard.slice(17, 25)} GMT`;
  const spacedDate = `${standard.slice(0, 3)} ${standard.slice(8, 11)} ${String(parsed.getUTCDate()).padStart(2, ' ')} ${standard.slice(17, 25)} ${parsed.getUTCFullYear()}`;
  if (
    normalized !== standard &&
    normalized !== legacy &&
    normalized !== spacedDate
  ) {
    return 30_000;
  }
  return Math.min(Math.max(date - now, 1_000), 300_000);
};

export const toModuleResponse = (response: UpstreamResponse) => {
  return {
    status: response.status,
    cookie: [...response.cookie],
    body: response.body,
  };
};

export const businessCode = (response: NcmApiResponse): number | undefined => {
  return isRecord(response.body) && response.body.code !== undefined
    ? Number(response.body.code)
    : undefined;
};

export const normalizeFailure = (
  error: unknown,
  cancelled = false,
  timedOut = false,
): NcmApiResponse => {
  if (Cause.isCause(error)) {
    cancelled ||= Cause.hasInterrupts(error);
    error = Cause.squash(error);
  }
  if (error instanceof PartialUpload) {
    const failure = normalizeFailure(error.cause, cancelled, timedOut);
    return {
      ...failure,
      body: {
        ...(isRecord(failure.body) ? failure.body : {}),
        partialCompletion: true,
        completedStages: error.completedStages.length,
      },
    };
  }
  if (timedOut) {
    error = new DeadlineExceeded({ message: 'Request timed out' });
  }
  if (error instanceof UpstreamRateLimited && error.response) {
    return {
      status: 429,
      cookie: [...error.response.cookie],
      body: {
        ...(isRecord(error.response.body)
          ? error.response.body
          : { code: 429, msg: error.message }),
        retryAfter: Math.ceil(error.retryAfterMs / 1_000),
      },
    };
  }
  if (error instanceof UpstreamRateLimited) {
    return {
      status: 429,
      cookie: [],
      body: {
        code: 429,
        msg: error.message,
        retryAfter: Math.ceil(error.retryAfterMs / 1_000),
      },
    };
  }
  if (
    (error instanceof ProtocolFailed ||
      error instanceof UpstreamBusinessFailed) &&
    error.response
  ) {
    return {
      status: error.response.status,
      cookie: [...error.response.cookie],
      body: error.response.body,
    };
  }
  if (isNcmApiResponse(error)) {
    return error;
  }
  const status =
    error instanceof DeadlineExceeded
      ? 504
      : cancelled
        ? 499
        : error instanceof InvalidModuleInput
          ? (error.status ?? 400)
          : error instanceof InvalidRequest || error instanceof TargetRejected
            ? 400
            : error instanceof AdmissionRejected
              ? 503
              : typeof error === 'object' &&
                  error !== null &&
                  'status' in error &&
                  typeof error.status === 'number'
                ? error.status
                : 502;
  const retryDelayMs =
    typeof error === 'object' &&
    error !== null &&
    'retryAfterMs' in error &&
    typeof error.retryAfterMs === 'number'
      ? error.retryAfterMs
      : undefined;
  return {
    status,
    cookie: [],
    body: {
      code: status,
      msg:
        status === 499
          ? 'Request cancelled'
          : error instanceof Error
            ? error.message
            : String(error),
      ...(retryDelayMs === undefined
        ? {}
        : { retryAfter: Math.ceil(retryDelayMs / 1_000) }),
    },
  };
};
export const isNcmApiResponse = (error: unknown): error is NcmApiResponse => {
  return (
    typeof error === 'object' &&
    error !== null &&
    'body' in error &&
    'cookie' in error &&
    'status' in error
  );
};

const normalizeUpstreamBody = (value: unknown): UpstreamBody => {
  if (
    value === null ||
    typeof value === 'boolean' ||
    typeof value === 'number' ||
    typeof value === 'string'
  ) {
    return value;
  }

  if (Array.isArray(value)) {
    return value as UpstreamBody;
  }

  if (isRecord(value)) {
    return value as UpstreamBody;
  }

  return {};
};

const stripCookieDomain = (cookie: string): string => {
  return cookie.replace(/\s*Domain=[^(;|$)]+;*/i, '');
};
