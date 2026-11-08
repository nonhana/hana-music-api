import type {
  CreateRequestOptions,
  NcmApiResponse,
  RequestProtocol,
} from '../types/index.ts';
import {
  InvalidRequest,
  ProtocolFailed,
  TargetRejected,
  UpstreamRateLimited,
} from './errors.ts';
import type { IdentitySnapshot } from './identity.ts';
import type { RequestAction } from './request-actions.ts';
import { businessCode } from './response.ts';

export const validateRequestTarget = (
  request: {
    readonly protocol: RequestProtocol;
    readonly target: string;
    readonly method: string;
  },
  url: string,
  identity: IdentitySnapshot,
): boolean => {
  if (
    request.protocol !== 'plain' &&
    (!request.target.startsWith('/api/') || request.method !== 'POST')
  ) {
    throw InvalidRequest.make({
      message: 'API requests require an /api/ target and POST method',
    });
  }
  const target = new URL(url);
  const apiHost = ['music.163.com', 'interface.music.163.com'].includes(
    target.hostname,
  );
  const scrobbleHost =
    request.protocol === 'eapi' &&
    request.target === '/api/feedback/weblog' &&
    target.hostname === 'clientlog.music.163.com';
  const secure =
    target.protocol === 'https:' && (!target.port || target.port === '443');
  if (
    target.username ||
    target.password ||
    !['http:', 'https:'].includes(target.protocol)
  ) {
    throw TargetRejected.make({ message: 'Request target is not allowed' });
  }
  if (request.protocol === 'plain') {
    const approved =
      apiHost ||
      target.hostname.endsWith('.127.net') ||
      target.hostname.endsWith('.163yun.com');
    if (!secure || !approved) {
      throw TargetRejected.make({
        message: `Raw request target is not allowed: ${target.hostname}`,
      });
    }
  } else if (
    (identity.cookie.MUSIC_U || identity.cookie.MUSIC_A) &&
    (!secure || (!apiHost && !scrobbleHost))
  ) {
    throw TargetRejected.make({
      message: 'Authenticated API target is not allowed',
    });
  }
  return secure && (apiHost || scrobbleHost);
};

export const isCacheable = (response: NcmApiResponse): boolean => {
  const code = businessCode(response);
  return response.status === 200 && (code === undefined || code === 200);
};

export const retryDecision = (
  error: unknown,
  attempt: number,
  options: CreateRequestOptions['retry'],
  random: number,
  action: Pick<RequestAction, 'semantic' | 'retry'>,
): number | undefined => {
  if (action.semantic !== 'read' || action.retry === 'never') {
    return undefined;
  }
  if (error instanceof UpstreamRateLimited) {
    return undefined;
  }
  const text = errorText(error).toLowerCase();
  const neverConnected =
    /eai_again|econnrefused|und_err_connect_timeout|\bconnect etimedout\b/.test(
      text,
    );
  const read = action.retry === 'read';
  const explicit = options?.retryNonIdempotent === true && read;
  const status =
    error instanceof ProtocolFailed
      ? error.response?.status
      : typeof error === 'object' && error !== null && 'status' in error
        ? Number(error.status)
        : undefined;
  if (status === 429 || status === 503 || status === 499 || status === 504) {
    return undefined;
  }
  const retryable =
    neverConnected ||
    (explicit &&
      (status !== undefined
        ? options?.statusCodes?.includes(status)
        : /socket|network|fetch failed|econnreset|terminated/.test(text)));
  const maxAttempts = explicit
    ? Math.min(Math.max(options?.retries ?? 2, 0), 5) + 1
    : 3;
  if (!retryable || attempt >= maxAttempts) {
    return undefined;
  }
  const base = Math.min(
    (options?.backoffMs ?? 300) * 2 ** (attempt - 1),
    options?.maxBackoffMs ?? 2_000,
  );
  return Math.max(
    0,
    Math.floor(options?.jitter === false ? base : base * (0.5 + random)),
  );
};

const errorText = (error: unknown, depth = 0): string => {
  const text =
    error instanceof Error ? `${error.name} ${error.message}` : String(error);
  if (
    depth >= 3 ||
    typeof error !== 'object' ||
    error === null ||
    !('cause' in error)
  ) {
    return text;
  }
  return `${text} ${errorText(error.cause, depth + 1)}`;
};
