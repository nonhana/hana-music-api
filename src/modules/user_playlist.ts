import type { ModuleRequest, NcmApiResponse } from '../types/index.ts'
import type { UserScopedListQuery } from '../types/modules.ts'

import { createOption } from '../core/options.ts'
// 用户歌单
import { normalizeLegacyModuleError, normalizeLegacyModuleResponse } from './_migration.ts'
const legacyModule = (query: UserScopedListQuery, request: ModuleRequest) => {
  const data = {
    uid: query.uid,
    limit: query.limit || 30,
    offset: query.offset || 0,
    includeVideo: true,
  }
  return request(`/api/user/playlist`, data, createOption(query, 'weapi'))
}

export default async function migratedUserPlaylist(
  query: UserScopedListQuery,
  request: ModuleRequest,
): Promise<NcmApiResponse> {
  try {
    return normalizeLegacyModuleResponse(await legacyModule(query, request))
  } catch (error) {
    throw normalizeLegacyModuleError(error)
  }
}
