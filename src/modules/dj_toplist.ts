import type { ModuleRequest, NcmApiResponse } from '../types/index.ts'
import type { LegacyModuleQuery } from '../types/modules.ts'

import { normalizeLegacyModuleError, normalizeLegacyModuleResponse } from './_migration.ts'
// 新晋电台榜/热门电台榜
const typeMap = {
  new: 0,
  hot: 1,
}
import { createOption } from '../core/options.ts'
const legacyModule = (query: LegacyModuleQuery, request: ModuleRequest) => {
  const typeKey = String(query.type ?? 'new') as keyof typeof typeMap
  const data = {
    limit: query.limit || 100,
    offset: query.offset || 0,
    type: typeMap[typeKey] ?? 0, //0为新晋,1为热门
  }
  return request(`/api/djradio/toplist`, data, createOption(query, 'weapi'))
}

export default async function migratedDjToplist(
  query: LegacyModuleQuery,
  request: ModuleRequest,
): Promise<NcmApiResponse> {
  try {
    return normalizeLegacyModuleResponse(await legacyModule(query, request))
  } catch (error) {
    throw normalizeLegacyModuleError(error)
  }
}
