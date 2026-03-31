import type { ModuleRequest, NcmApiResponse } from '../types/index.ts'
import type { UserSummaryQuery } from '../types/modules.ts'

import { createOption } from '../core/options.ts'
// 收藏计数
import { normalizeLegacyModuleError, normalizeLegacyModuleResponse } from './_migration.ts'
const legacyModule = (query: UserSummaryQuery, request: ModuleRequest) => {
  return request(`/api/subcount`, {}, createOption(query, 'weapi'))
}

export default async function migratedUserSubcount(
  query: UserSummaryQuery,
  request: ModuleRequest,
): Promise<NcmApiResponse> {
  try {
    return normalizeLegacyModuleResponse(await legacyModule(query, request))
  } catch (error) {
    throw normalizeLegacyModuleError(error)
  }
}
