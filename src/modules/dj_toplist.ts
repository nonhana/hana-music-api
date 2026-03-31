import type { ModuleRequest, NcmApiResponse } from '../types/index.ts'
import type { LegacyModuleQuery } from '../types/modules.ts'

// 新晋电台榜/热门电台榜
import { createOption } from '../core/options.ts'
import { normalizeLegacyModuleError, normalizeLegacyModuleResponse } from './_migration.ts'
import { resolveDjToplistType } from './_module-inputs.ts'
const legacyModule = (query: LegacyModuleQuery, request: ModuleRequest) => {
  const data = {
    limit: query.limit || 100,
    offset: query.offset || 0,
    type: resolveDjToplistType(query.type), //0为新晋,1为热门
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
