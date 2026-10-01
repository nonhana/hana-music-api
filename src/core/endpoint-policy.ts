import type {
  CreateRequestOptions,
  NcmApiResponse,
  RequestIntent,
} from '../types/index.ts';
import { InvalidRequest, ProtocolFailed, TargetRejected } from './errors.ts';
import type { IdentitySnapshot } from './identity.ts';
import { businessCode } from './response.ts';

const readModules = new Set([
  'search',
  'lyric',
  'song_detail',
  'playlist_detail',
]);
const uploadModules = new Set([
  'avatar_upload',
  'playlist_cover_update',
  'cloud',
  'voice_upload',
]);
const noRetryUris = new Set([
  '/api/activate/initProfile',
  '/api/user/replaceCellphone',
  '/api/point/dailyTask',
  '/api/point/expense',
  '/api/point/receipt',
  '/api/vipnewcenter/app/level/task/reward/get',
  '/api/creator/user/access',
  '/api/feedback/weblog',
  '/api/v2/resource/comments/hug/listener',
  '/api/voice/workbench/radio/program/trans',
  '/api/playlist/import/task/status/v2',
]);

export const validateRequestTarget = (
  intent: RequestIntent,
  url: string,
  identity: IdentitySnapshot,
): void => {
  const targetSemantic =
    intent.protocol === 'plain'
      ? ['GET', 'HEAD'].includes(intent.method)
        ? 'read'
        : 'upload'
      : requestSemantic(intent.target);
  if (intent.semantic !== targetSemantic) {
    throw new InvalidRequest({
      message: 'Request semantic does not match its target and method',
    });
  }
  if (
    intent.protocol !== 'plain' &&
    (!intent.target.startsWith('/api/') || intent.method !== 'POST')
  ) {
    throw new InvalidRequest({
      message: 'API requests require an /api/ target and POST method',
    });
  }
  const target = new URL(url);
  const apiHost = ['music.163.com', 'interface.music.163.com'].includes(
    target.hostname,
  );
  const secure =
    target.protocol === 'https:' && (!target.port || target.port === '443');
  if (
    target.username ||
    target.password ||
    !['http:', 'https:'].includes(target.protocol)
  ) {
    throw new TargetRejected({ message: 'Request target is not allowed' });
  }
  if (intent.protocol === 'plain') {
    const approved =
      apiHost ||
      target.hostname.endsWith('.127.net') ||
      target.hostname.endsWith('.163yun.com');
    if (!secure || !approved) {
      throw new TargetRejected({
        message: `Raw request target is not allowed: ${target.hostname}`,
      });
    }
  } else if (
    (identity.cookie.MUSIC_U || identity.cookie.MUSIC_A) &&
    (!secure || !apiHost)
  ) {
    throw new TargetRejected({
      message: 'Authenticated API target is not allowed',
    });
  }
};

export const requestSemantic = (uri: string): RequestIntent['semantic'] => {
  if (/login|logout|register|captcha/.test(uri)) {
    return 'login';
  }
  if (/upload|\/nos\/|\/cloud\//.test(uri)) {
    return 'upload';
  }
  return noRetryUris.has(uri) ||
    /\/listen\/together\/|\/frontrisk\/verify\/|\/ordering\/|\/user\/(?:follow|delfollow)\//.test(
      uri,
    ) ||
    /\/(?:like|unlike|dislike|batch|publish|delete|del|update|subscribe|unsubscribe|sub|unsub|send|sign|report|add|reply|create|remove|manipulate|share|forward|edit|collect|submit|receive|obtain)(?:\/|$)/.test(
      uri,
    )
    ? 'write'
    : 'read';
};

export const isReadModule = (identifier: string): boolean =>
  readModules.has(identifier);
export const isUploadModule = (identifier: string): boolean =>
  uploadModules.has(identifier);
export const isCacheable = (response: NcmApiResponse): boolean => {
  const code = businessCode(response);
  return response.status === 200 && (code === undefined || code === 200);
};

export const retryDecision = (
  uri: string,
  error: unknown,
  attempt: number,
  options: CreateRequestOptions['retry'],
  random: number,
): number | undefined => {
  if (requestSemantic(uri) !== 'read') {
    return undefined;
  }
  const text = errorText(error).toLowerCase();
  const neverConnected =
    /eai_again|econnrefused|und_err_connect_timeout|\bconnect etimedout\b/.test(
      text,
    );
  const read =
    /\/search\/|\/song\/lyric|\/song\/detail|\/playlist\/detail/.test(uri);
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
