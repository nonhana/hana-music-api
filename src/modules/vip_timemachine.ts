import type { ModuleRequest, NcmApiResponse } from '../types/index.ts'
import type { LegacyModuleQuery } from '../types/modules.ts'

import { createOption } from '../core/options.ts'
// 黑胶时光机
import { normalizeLegacyModuleError, normalizeLegacyModuleResponse } from './_migration.ts'
const legacyModule = (query: LegacyModuleQuery, request: ModuleRequest) => {
  const data: Record<string, unknown> = {}
  if (query.startTime && query.endTime) {
    data.startTime = query.startTime
    data.endTime = query.endTime
    data.type = 1
    data.limit = query.limit || 60
  }
  return request(`/api/vipmusic/newrecord/weekflow`, data, createOption(query, 'weapi'))
}

export default async function migratedVipTimemachine(
  query: LegacyModuleQuery,
  request: ModuleRequest,
): Promise<NcmApiResponse> {
  try {
    return normalizeLegacyModuleResponse(await legacyModule(query, request))
  } catch (error) {
    throw normalizeLegacyModuleError(error)
  }
}
