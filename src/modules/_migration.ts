import type { NcmApiResponse } from '../types/index.ts'
import type { UpstreamBody } from '../types/upstream.ts'

function isRecordLike(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function normalizeCookieList(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return []
  }

  return value.map((entry) => String(entry))
}

function normalizeStatusCode(value: unknown): number {
  const status = typeof value === 'number' ? value : Number(value)

  if (!Number.isFinite(status)) {
    return 200
  }

  return status >= 100 && status < 600 ? status : 200
}

function toResponseLike(value: unknown): NcmApiResponse | null {
  if (!isRecordLike(value) || !('status' in value) || !('body' in value)) {
    return null
  }

  return {
    body: normalizeBody(value.body),
    cookie: normalizeCookieList(value.cookie),
    status: normalizeStatusCode(value.status),
  }
}

/**
 * 将旧模块的多种返回形态收敛为新服务层稳定消费的 `NcmApiResponse`。
 */
export function normalizeLegacyModuleResponse(value: unknown): NcmApiResponse {
  const normalized = toResponseLike(value)
  if (normalized) {
    return normalized
  }

  return {
    body: normalizeBody(value),
    cookie: [],
    status: 200,
  }
}

/**
 * 旧模块有时会直接 `throw { status, body }`，这里补齐 `cookie`，避免被当成未知错误吞掉。
 */
export function normalizeLegacyModuleError(error: unknown): unknown {
  return toResponseLike(error) ?? error
}

function normalizeBody(value: unknown): UpstreamBody {
  if (
    value === null ||
    typeof value === 'boolean' ||
    typeof value === 'number' ||
    typeof value === 'string' ||
    Array.isArray(value)
  ) {
    return value
  }

  if (isRecordLike(value)) {
    return value
  }

  return {}
}
