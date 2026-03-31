import type { ModuleRequest, NcmApiResponse } from '../types/index.ts'
import type { AlbumQuery } from '../types/modules.ts'

import { createOption } from '../core/options.ts'
// 专辑内容
import { normalizeLegacyModuleError, normalizeLegacyModuleResponse } from './_migration.ts'
const legacyModule = (query: AlbumQuery, request: ModuleRequest) => {
  return request(`/api/v1/album/${query.id}`, {}, createOption(query, 'weapi'))
}

export default async function migratedAlbum(
  query: AlbumQuery,
  request: ModuleRequest,
): Promise<NcmApiResponse> {
  try {
    return normalizeLegacyModuleResponse(await legacyModule(query, request))
  } catch (error) {
    throw normalizeLegacyModuleError(error)
  }
}
