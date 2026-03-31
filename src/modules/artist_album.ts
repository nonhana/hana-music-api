import type { ModuleRequest, NcmApiResponse } from '../types/index.ts'
import type { ArtistPagedQuery } from '../types/modules.ts'

import { createOption } from '../core/options.ts'
// 歌手专辑列表
import { normalizeLegacyModuleError, normalizeLegacyModuleResponse } from './_migration.ts'
const legacyModule = (query: ArtistPagedQuery, request: ModuleRequest) => {
  const data = {
    limit: query.limit || 30,
    offset: query.offset || 0,
    total: true,
  }
  return request(`/api/artist/albums/${query.id}`, data, createOption(query, 'weapi'))
}

export default async function migratedArtistAlbum(
  query: ArtistPagedQuery,
  request: ModuleRequest,
): Promise<NcmApiResponse> {
  try {
    return normalizeLegacyModuleResponse(await legacyModule(query, request))
  } catch (error) {
    throw normalizeLegacyModuleError(error)
  }
}
