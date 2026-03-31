import type { ModuleRequest, NcmApiResponse } from '../types/index.ts'
import type { ArtistQuery } from '../types/modules.ts'

// 歌手热门 50 首歌曲
import { createOption } from '../core/options.ts'
import { normalizeLegacyModuleError, normalizeLegacyModuleResponse } from './_migration.ts'
const legacyModule = (query: ArtistQuery, request: ModuleRequest) => {
  const data = {
    id: query.id,
  }
  return request(`/api/artist/top/song`, data, createOption(query, 'weapi'))
}

export default async function migratedArtistTopSong(
  query: ArtistQuery,
  request: ModuleRequest,
): Promise<NcmApiResponse> {
  try {
    return normalizeLegacyModuleResponse(await legacyModule(query, request))
  } catch (error) {
    throw normalizeLegacyModuleError(error)
  }
}
