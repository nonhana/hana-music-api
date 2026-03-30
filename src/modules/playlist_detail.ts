import type { ModuleRequest, NcmApiResponse } from '../types/index.ts'
import type { PlaylistDetailQuery } from '../types/modules.ts'

import { createOption } from '../core/options.ts'
// 歌单详情
import { normalizeLegacyModuleError, normalizeLegacyModuleResponse } from './_migration.ts'
const legacyModule = (query: PlaylistDetailQuery, request: ModuleRequest) => {
  const data = {
    id: query.id,
    n: 100000,
    s: query.s || 8,
  }
  return request(`/api/v6/playlist/detail`, data, createOption(query))
}

export default async function migratedPlaylistDetail(
  query: PlaylistDetailQuery,
  request: ModuleRequest,
): Promise<NcmApiResponse> {
  try {
    return normalizeLegacyModuleResponse(await legacyModule(query, request))
  } catch (error) {
    throw normalizeLegacyModuleError(error)
  }
}
