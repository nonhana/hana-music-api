import type { ModuleRequest, NcmApiResponse } from '../types/index.ts'
import type { LegacyModuleQuery } from '../types/modules.ts'

import { createOption } from '../core/options.ts'
import { cookieToJson } from '../core/utils.ts'
import { normalizeLegacyModuleError, normalizeLegacyModuleResponse } from './_migration.ts'
const legacyModule = (query: LegacyModuleQuery, request: ModuleRequest) => {
  const uri = String(query.uri ?? '')
  let data: Record<string, any> = {}
  try {
    data =
      typeof query.data === 'string'
        ? (JSON.parse(query.data) as Record<string, any>)
        : ((query.data as Record<string, any> | undefined) ?? {})
    if (typeof data.cookie === 'string') {
      data.cookie = cookieToJson(data.cookie)
      query.cookie = data.cookie
    }
  } catch {
    data = {}
  }

  const crypto = query.crypto || ''

  const res = request(
    uri,
    data,
    createOption(query, String(crypto) as '' | 'api' | 'eapi' | 'linuxapi' | 'weapi'),
  )
  return res
}

export default async function migratedApi(
  query: LegacyModuleQuery,
  request: ModuleRequest,
): Promise<NcmApiResponse> {
  try {
    return normalizeLegacyModuleResponse(await legacyModule(query, request))
  } catch (error) {
    throw normalizeLegacyModuleError(error)
  }
}
