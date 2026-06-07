import type { ModuleRequest, NcmApiResponse } from '../types/index.ts'
import type { AlbumQuery } from '../types/modules.ts'

import { createOption } from '../core/options.ts'
import { normalizeLegacyModuleError, normalizeLegacyModuleResponse } from './_migration.ts'

const legacyModule = (query: AlbumQuery, request: ModuleRequest) => {
  const data = {
    id: query.id,
  }
  return request(`/api/album/detail/dynamic`, data, createOption(query, 'weapi'))
}

/**
 * 专辑动态信息
 */
export default async function migratedAlbumDetailDynamic(
  query: AlbumQuery,
  request: ModuleRequest,
): Promise<NcmApiResponse> {
  try {
    return normalizeLegacyModuleResponse(await legacyModule(query, request))
  } catch (error) {
    throw normalizeLegacyModuleError(error)
  }
}
