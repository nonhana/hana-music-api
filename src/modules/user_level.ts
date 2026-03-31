import type { ModuleRequest, NcmApiResponse } from '../types/index.ts'
import type { UserSummaryQuery } from '../types/modules.ts'

import { createOption } from '../core/options.ts'
// 类别热门电台
import { normalizeLegacyModuleError, normalizeLegacyModuleResponse } from './_migration.ts'
const legacyModule = (query: UserSummaryQuery, request: ModuleRequest) => {
  const data = {}
  return request(`/api/user/level`, data, createOption(query, 'weapi'))
}

export default async function migratedUserLevel(
  query: UserSummaryQuery,
  request: ModuleRequest,
): Promise<NcmApiResponse> {
  try {
    return normalizeLegacyModuleResponse(await legacyModule(query, request))
  } catch (error) {
    throw normalizeLegacyModuleError(error)
  }
}
