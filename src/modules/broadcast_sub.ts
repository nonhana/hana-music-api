import type { ModuleRequest, NcmApiResponse } from '../types/index.ts'
import type { LegacyModuleQuery } from '../types/modules.ts'

import { createOption } from '../core/options.ts'
// 广播电台 - 收藏/取消收藏电台
import { normalizeLegacyModuleError, normalizeLegacyModuleResponse } from './_migration.ts'
const legacyModule = (query: LegacyModuleQuery, request: ModuleRequest) => {
  query.t = Number(query.t) === 1 ? 'false' : 'true'
  const data = {
    contentType: 'BROADCAST',
    contentId: query.id,
    cancelCollect: query.t,
  }
  return request(`/api/content/interact/collect`, data, createOption(query))
}

export default async function migratedBroadcastSub(
  query: LegacyModuleQuery,
  request: ModuleRequest,
): Promise<NcmApiResponse> {
  try {
    return normalizeLegacyModuleResponse(await legacyModule(query, request))
  } catch (error) {
    throw normalizeLegacyModuleError(error)
  }
}
