import type { ModuleRequest, NcmApiResponse } from '../types/index.ts'
import type { ArtistPagedQuery } from '../types/modules.ts'

import { createOption } from '../core/options.ts'
// 歌手相关MV
import { normalizeLegacyModuleError, normalizeLegacyModuleResponse } from './_migration.ts'
const legacyModule = (query: ArtistPagedQuery, request: ModuleRequest) => {
  const data = {
    artistId: query.id,
    limit: query.limit,
    offset: query.offset,
    total: true,
  }
  return request(`/api/artist/mvs`, data, createOption(query, 'weapi'))
}

export default async function migratedArtistMv(
  query: ArtistPagedQuery,
  request: ModuleRequest,
): Promise<NcmApiResponse> {
  try {
    return normalizeLegacyModuleResponse(await legacyModule(query, request))
  } catch (error) {
    throw normalizeLegacyModuleError(error)
  }
}
