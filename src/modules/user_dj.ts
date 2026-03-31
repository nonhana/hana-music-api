import type { ModuleRequest, NcmApiResponse } from '../types/index.ts'
import type { UserScopedListQuery } from '../types/modules.ts'

import { createOption } from '../core/options.ts'
// 用户电台节目
import { normalizeLegacyModuleError, normalizeLegacyModuleResponse } from './_migration.ts'
const legacyModule = (query: UserScopedListQuery, request: ModuleRequest) => {
  const data = {
    limit: query.limit || 30,
    offset: query.offset || 0,
  }
  return request(`/api/dj/program/${query.uid}`, data, createOption(query, 'weapi'))
}

export default async function migratedUserDj(
  query: UserScopedListQuery,
  request: ModuleRequest,
): Promise<NcmApiResponse> {
  try {
    return normalizeLegacyModuleResponse(await legacyModule(query, request))
  } catch (error) {
    throw normalizeLegacyModuleError(error)
  }
}
