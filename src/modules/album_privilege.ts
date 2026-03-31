import type { ModuleRequest, NcmApiResponse } from '../types/index.ts'
import type { AlbumQuery } from '../types/modules.ts'

import { createOption } from '../core/options.ts'
// 获取专辑歌曲的音质
import { normalizeLegacyModuleError, normalizeLegacyModuleResponse } from './_migration.ts'
const legacyModule = (query: AlbumQuery, request: ModuleRequest) => {
  const data = {
    id: query.id,
  }
  return request(`/api/album/privilege`, data, createOption(query))
}

export default async function migratedAlbumPrivilege(
  query: AlbumQuery,
  request: ModuleRequest,
): Promise<NcmApiResponse> {
  try {
    return normalizeLegacyModuleResponse(await legacyModule(query, request))
  } catch (error) {
    throw normalizeLegacyModuleError(error)
  }
}
