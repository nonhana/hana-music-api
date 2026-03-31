import type { ModuleRequest, NcmApiResponse } from '../types/index.ts'
import type { AlbumNewestQuery } from '../types/modules.ts'

import { createOption } from '../core/options.ts'
// 最新专辑
import { normalizeLegacyModuleError, normalizeLegacyModuleResponse } from './_migration.ts'
const legacyModule = (query: AlbumNewestQuery, request: ModuleRequest) => {
  return request(`/api/discovery/newAlbum`, {}, createOption(query, 'weapi'))
}

export default async function migratedAlbumNewest(
  query: AlbumNewestQuery,
  request: ModuleRequest,
): Promise<NcmApiResponse> {
  try {
    return normalizeLegacyModuleResponse(await legacyModule(query, request))
  } catch (error) {
    throw normalizeLegacyModuleError(error)
  }
}
