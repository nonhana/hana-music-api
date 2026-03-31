import type { ModuleRequest, NcmApiResponse } from '../types/index.ts'
import type { UserScopedQuery } from '../types/modules.ts'

import { createOption } from '../core/options.ts'
// 用户创建的电台
import { normalizeLegacyModuleError, normalizeLegacyModuleResponse } from './_migration.ts'
const legacyModule = (query: UserScopedQuery, request: ModuleRequest) => {
  const data = {
    userId: query.uid,
  }
  return request(`/api/djradio/get/byuser`, data, createOption(query, 'weapi'))
}

export default async function migratedUserAudio(
  query: UserScopedQuery,
  request: ModuleRequest,
): Promise<NcmApiResponse> {
  try {
    return normalizeLegacyModuleResponse(await legacyModule(query, request))
  } catch (error) {
    throw normalizeLegacyModuleError(error)
  }
}
