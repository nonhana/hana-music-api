import type { ModuleRequest, NcmApiResponse } from '../types/index.ts'
import type { UserScopedListQuery } from '../types/modules.ts'

import { createOption } from '../core/options.ts'
// 关注TA的人(粉丝)
import { normalizeLegacyModuleError, normalizeLegacyModuleResponse } from './_migration.ts'
const legacyModule = (query: UserScopedListQuery, request: ModuleRequest) => {
  const data = {
    userId: query.uid,
    time: '0',
    limit: query.limit || 30,
    offset: query.offset || 0,
    getcounts: 'true',
  }
  return request(`/api/user/getfolloweds/${query.uid}`, data, createOption(query))
}

export default async function migratedUserFolloweds(
  query: UserScopedListQuery,
  request: ModuleRequest,
): Promise<NcmApiResponse> {
  try {
    return normalizeLegacyModuleResponse(await legacyModule(query, request))
  } catch (error) {
    throw normalizeLegacyModuleError(error)
  }
}
