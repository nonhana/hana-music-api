import type {
  CookieRecord,
  ModuleQuery,
  ModuleRequest,
  NcmApiResponse,
  RequestCrypto,
} from '../types/index.ts'
import type { DynamicJsonRecord } from '../types/upstream.ts'

import { createOption } from '../core/options.ts'
import { cookieToJson, isRecord } from '../core/utils.ts'

export interface ApiDebugRequestPayload extends ModuleQuery {
  crypto?: unknown
  data?: DynamicJsonRecord | string
  uri?: unknown
}

export async function invokeApiDebugRequest(
  payload: ApiDebugRequestPayload,
  request: ModuleRequest,
  fallbackCookie: CookieRecord = {},
): Promise<NcmApiResponse> {
  const uri = typeof payload.uri === 'string' ? payload.uri : ''
  const data = readDynamicJsonRecord(payload.data)
  const cookie = readEffectiveCookie(payload.cookie, data, fallbackCookie)
  const crypto = readRequestCrypto(payload.crypto)

  return request(
    uri,
    data,
    createOption(
      {
        ...payload,
        cookie,
        crypto,
      },
      crypto,
    ),
  )
}

function readDynamicJsonRecord(value: unknown): DynamicJsonRecord {
  try {
    const parsed = typeof value === 'string' ? JSON.parse(value) : value
    return isRecord(parsed) ? parsed : {}
  } catch {
    return {}
  }
}

function readEffectiveCookie(
  cookie: ModuleQuery['cookie'],
  data: DynamicJsonRecord,
  fallbackCookie: CookieRecord,
): CookieRecord {
  const normalizedTopLevelCookie = normalizeCookieRecord(cookie)
  const normalizedBodyCookie = normalizeCookieRecord(data.cookie)

  if (normalizedBodyCookie) {
    data.cookie = normalizedBodyCookie
    return normalizedBodyCookie
  }

  if (normalizedTopLevelCookie) {
    return normalizedTopLevelCookie
  }

  return fallbackCookie
}

function normalizeCookieRecord(value: unknown): CookieRecord | null {
  if (typeof value === 'string') {
    return cookieToJson(value)
  }

  if (isRecord(value)) {
    return value as CookieRecord
  }

  return null
}

function readRequestCrypto(value: unknown): RequestCrypto {
  if (
    value === '' ||
    value === 'api' ||
    value === 'eapi' ||
    value === 'linuxapi' ||
    value === 'weapi'
  ) {
    return value
  }

  return ''
}
