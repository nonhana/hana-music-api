import type { ModuleRequest, NcmApiResponse } from '../types/index.ts'
import type { AlbumSublistQuery } from '../types/modules.ts'

import { createOption } from '../core/options.ts'
// 已收藏专辑列表
import { normalizeLegacyModuleError, normalizeLegacyModuleResponse } from './_migration.ts'
const legacyModule = (query: AlbumSublistQuery, request: ModuleRequest) => {
  const data = {
    limit: query.limit || 25,
    offset: query.offset || 0,
    total: true,
  }
  return request(`/api/album/sublist`, data, createOption(query, 'weapi'))
}

export default async function migratedAlbumSublist(
  query: AlbumSublistQuery,
  request: ModuleRequest,
): Promise<NcmApiResponse> {
  try {
    return normalizeLegacyModuleResponse(await legacyModule(query, request))
  } catch (error) {
    throw normalizeLegacyModuleError(error)
  }
}
