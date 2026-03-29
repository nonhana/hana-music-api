import type { CookieRecord, CreateRequestOptions, RequestCrypto } from '../types/index.ts'

interface OptionSource {
  readonly checkToken?: unknown
  readonly cookie?: CookieRecord | string
  readonly crypto?: unknown
  readonly domain?: unknown
  readonly e_r?: unknown
  readonly proxy?: unknown
  readonly realIP?: unknown
  readonly ua?: unknown
}

/**
 * 将模块层的 query 对象收敛成 request 层可消费的配置结构。
 * 这里尽量保持旧项目的字段语义，避免过早引入额外的标准化逻辑。
 */
export function createOption(
  query: OptionSource,
  crypto: RequestCrypto = '',
): CreateRequestOptions {
  return {
    checkToken: query.checkToken ? toBooleanLike(query.checkToken) : false,
    cookie: query.cookie,
    crypto: toRequestCrypto(query.crypto) ?? crypto,
    domain: toOptionalString(query.domain) ?? '',
    e_r: query.e_r === undefined || query.e_r === null ? undefined : toBooleanLike(query.e_r),
    proxy: toOptionalString(query.proxy),
    realIP: toOptionalString(query.realIP),
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
