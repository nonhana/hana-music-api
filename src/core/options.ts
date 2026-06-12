import type {
  BooleanLike,
  CookieRecord,
  CreateRequestOptions,
  ModuleQuery,
  RequestCrypto,
} from '../types/index.ts'

import { toBoolean } from './utils.ts'

interface OptionSource {
  readonly acceptGzip?: unknown
  readonly checkToken?: unknown
  readonly connectionStrategy?: CreateRequestOptions['connectionStrategy']
  readonly cookie?: CookieRecord | string
  readonly crypto?: unknown
  readonly domain?: unknown
  readonly e_r?: unknown
  readonly fetcher?: CreateRequestOptions['fetcher']
  readonly headers?: CreateRequestOptions['headers']
  readonly ip?: unknown
  readonly onRequestEvent?: CreateRequestOptions['onRequestEvent']
  readonly proxy?: unknown
  readonly realIP?: unknown
  readonly retry?: CreateRequestOptions['retry']
  readonly state?: CreateRequestOptions['state']
  readonly timeoutMs?: unknown
  readonly ua?: unknown
}

/**
 * 将模块层的 query 对象收敛成 request 层可消费的配置结构。
 * 这里尽量保持旧项目的字段语义，避免过早引入额外的标准化逻辑。
 */
export function createOption(
  query: ModuleQuery & OptionSource,
  crypto: RequestCrypto = '',
): CreateRequestOptions {
  return {
    acceptGzip:
      query.acceptGzip === undefined || query.acceptGzip === null
        ? undefined
        : toBoolean(query.acceptGzip as BooleanLike) === true,
    checkToken: query.checkToken ? toBooleanLike(query.checkToken) : false,
    connectionStrategy: query.connectionStrategy,
    cookie: query.cookie,
    crypto: toRequestCrypto(query.crypto) ?? crypto,
    domain: toOptionalString(query.domain) ?? '',
    e_r: query.e_r === undefined || query.e_r === null ? undefined : toBooleanLike(query.e_r),
    fetcher: query.fetcher,
    headers: query.headers,
    ip: toOptionalString(query.ip),
    onRequestEvent: query.onRequestEvent,
    proxy: toOptionalString(query.proxy),
    realIP: toOptionalString(query.realIP),
    retry: query.retry,
    state: query.state,
    timeoutMs: toOptionalNumber(query.timeoutMs),
    ua: toOptionalString(query.ua) ?? '',
  }
}

function toBooleanLike(value: unknown): boolean | number | string {
  if (typeof value === 'boolean' || typeof value === 'number' || typeof value === 'string') {
    return value
  }

  return JSON.stringify(value)
}

function toOptionalString(value: unknown): string | undefined {
  if (value === undefined || value === null) {
    return undefined
  }

  if (typeof value === 'string') {
    return value
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value)
  }

  return JSON.stringify(value)
}

function toOptionalNumber(value: unknown): number | undefined {
  if (value === undefined || value === null || value === '') {
    return undefined
  }

  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : undefined
  }

  if (typeof value === 'string') {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : undefined
  }

  return undefined
}

function toRequestCrypto(value: unknown): RequestCrypto | undefined {
  const normalized = toOptionalString(value)
  if (
    normalized === undefined ||
    normalized === '' ||
    normalized === 'api' ||
    normalized === 'eapi' ||
    normalized === 'linuxapi' ||
    normalized === 'weapi'
  ) {
    return normalized
  }

  return undefined
}
