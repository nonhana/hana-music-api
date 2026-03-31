import type { ModuleRequest, NcmApiResponse } from '../types/index.ts'
import type { ApiQuery } from '../types/modules.ts'
import type { DynamicJsonRecord } from '../types/upstream.ts'

import { createOption } from '../core/options.ts'
import { cookieToJson, isRecord } from '../core/utils.ts'
import { normalizeLegacyModuleError, normalizeLegacyModuleResponse } from './_migration.ts'
const legacyModule = (query: ApiQuery, request: ModuleRequest) => {
  const uri = String(query.uri ?? '')
  let data: DynamicJsonRecord = {}
  try {
    data =
      typeof query.data === 'string'
        ? readDynamicJsonRecord(JSON.parse(query.data))
        : readDynamicJsonRecord(query.data)
    if (typeof data.cookie === 'string') {
      const normalizedCookie = cookieToJson(data.cookie)
      data.cookie = normalizedCookie
      query.cookie = normalizedCookie
    }
  } catch {
    data = {}
  }

  const crypto = readRequestCrypto(query.crypto)

  const res = request(uri, data, createOption(query, crypto))
  return res
}

export default async function migratedApi(
  query: ApiQuery,
  request: ModuleRequest,
): Promise<NcmApiResponse> {
  try {
    return normalizeLegacyModuleResponse(await legacyModule(query, request))
  } catch (error) {
    throw normalizeLegacyModuleError(error)
  }
}

function readDynamicJsonRecord(value: unknown): DynamicJsonRecord {
  if (isRecord(value)) {
    return value
  }

  return {}
}

function readRequestCrypto(value: unknown): '' | 'api' | 'eapi' | 'linuxapi' | 'weapi' {
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
