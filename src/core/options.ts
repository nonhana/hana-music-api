import type {
  CookieRecord,
  CreateRequestOptions,
  ModuleQuery,
  RequestCrypto,
} from '../types/index.ts';
import { InvalidRequest } from './errors.ts';
import { isRecord, toBoolean } from './utils.ts';

interface OptionSource {
  readonly acceptGzip?: unknown;
  readonly connectionStrategy?: CreateRequestOptions['connectionStrategy'];
  readonly cookie?: CookieRecord | string;
  readonly crypto?: unknown;
  readonly domain?: unknown;
  readonly e_r?: unknown;
  readonly fetcher?: CreateRequestOptions['fetcher'];
  readonly headers?: CreateRequestOptions['headers'];
  readonly ip?: unknown;
  readonly onRequestEvent?: CreateRequestOptions['onRequestEvent'];
  readonly proxy?: unknown;
  readonly realIP?: unknown;
  readonly retry?: CreateRequestOptions['retry'];
  readonly signal?: AbortSignal;
  readonly state?: CreateRequestOptions['state'];
  readonly timeoutMs?: unknown;
  readonly ua?: unknown;
}

// 仅供显式低层 createRequest；普通模块配置由独立合同校验。
export const createOption = (
  query: ModuleQuery & OptionSource,
  crypto: RequestCrypto = '',
): CreateRequestOptions => ({
  acceptGzip:
    query.acceptGzip === undefined || query.acceptGzip === null
      ? undefined
      : toBoolean(
          typeof query.acceptGzip === 'boolean' ||
            typeof query.acceptGzip === 'number' ||
            typeof query.acceptGzip === 'string'
            ? query.acceptGzip
            : undefined,
        ) === true,
  connectionStrategy: query.connectionStrategy,
  cookie: query.cookie,
  crypto: toRequestCrypto(query.crypto) ?? crypto,
  domain: toOptionalString(query.domain) ?? '',
  e_r:
    query.e_r === undefined || query.e_r === null
      ? undefined
      : toBooleanLike(query.e_r),
  fetcher: query.fetcher,
  headers: query.headers,
  ip: toOptionalString(query.ip),
  onRequestEvent: query.onRequestEvent,
  proxy: toOptionalString(query.proxy),
  realIP: toOptionalString(query.realIP),
  retry: query.retry,
  signal: query.signal,
  state: query.state,
  timeoutMs: toOptionalNumber(query.timeoutMs),
  ua: toOptionalString(query.ua) ?? '',
});

const toBooleanLike = (value: unknown): boolean | number | string => {
  if (
    typeof value === 'boolean' ||
    typeof value === 'number' ||
    typeof value === 'string'
  ) {
    return value;
  }

  return JSON.stringify(value);
};

const toOptionalString = (value: unknown): string | undefined => {
  if (value === undefined || value === null) {
    return undefined;
  }

  if (typeof value === 'string') {
    return value;
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }

  return JSON.stringify(value);
};

const toOptionalNumber = (value: unknown): number | undefined => {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }

  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : undefined;
  }

  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }

  return undefined;
};

const toRequestCrypto = (value: unknown): RequestCrypto | undefined => {
  const normalized = toOptionalString(value);
  if (
    normalized === undefined ||
    normalized === '' ||
    normalized === 'api' ||
    normalized === 'eapi' ||
    normalized === 'linuxapi' ||
    normalized === 'weapi'
  ) {
    return normalized;
  }

  return undefined;
};

export const moduleConfigKeys = [
  'connectionStrategy',
  'cookie',
  'fetcher',
  'ip',
  'onRequestEvent',
  'proxy',
  'realIP',
  'retry',
  'signal',
  'state',
  'timeoutMs',
  'checkToken',
] as const;

export const removedModuleConfigKeys = [
  'crypto',
  'ua',
  'domain',
  'e_r',
  'acceptGzip',
  'headers',
  'deviceId',
] as const;

export const validateModuleConfig = (value: unknown, client = false): void => {
  if (!isRecord(value))
    throw InvalidRequest.make({ message: 'Module config must be an object' });
  const allowed: ReadonlyArray<string> = client
    ? [...moduleConfigKeys, 'cache', 'identityPool']
    : moduleConfigKeys;
  for (const key of Reflect.ownKeys(value)) {
    if (typeof key !== 'string' || !allowed.includes(key)) {
      throw InvalidRequest.make({
        message: `Module execution option is not allowed: ${String(key)}`,
      });
    }
  }
};

export const validateModuleQuery = (value: unknown): void => {
  if (!isRecord(value)) return;
  for (const key of [
    ...moduleConfigKeys,
    ...removedModuleConfigKeys,
    'cache',
    'identityPool',
  ]) {
    if (Object.hasOwn(value, key))
      throw InvalidRequest.make({
        message: `Execution option belongs in config: ${key}`,
      });
  }
};
