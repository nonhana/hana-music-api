import type { ModuleRequest, NcmApiResponse } from '../types/index.ts'
import type { LegacyModuleQuery } from '../types/modules.ts'
import { normalizeLegacyModuleError, normalizeLegacyModuleResponse } from './_migration.ts'
// 广播电台 - 全部电台

import { createOption } from '../core/options.ts'
const legacyModule = (query: LegacyModuleQuery, request: ModuleRequest) => {
  const data = {
    categoryId: query.categoryId || '0',
    regionId: query.regionId || '0',
    limit: query.limit || '20',
    lastId: query.lastId || '0',
    score: query.score || '-1',
  }
  return request(`/api/voice/broadcast/channel/list`, data, createOption(query))
}

export default async function migratedBroadcastChannelList(query: LegacyModuleQuery, request: ModuleRequest): Promise<NcmApiResponse> {
  try {
    return normalizeLegacyModuleResponse(await legacyModule(query, request))
  } catch (error) {
    throw normalizeLegacyModuleError(error)
  }
}
