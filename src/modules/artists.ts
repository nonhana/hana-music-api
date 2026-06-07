import type { ModuleRequest, NcmApiResponse } from '../types/index.ts'
import type { ArtistQuery } from '../types/modules.ts'

import { createOption } from '../core/options.ts'
import { normalizeLegacyModuleError, normalizeLegacyModuleResponse } from './_migration.ts'

const legacyModule = (query: ArtistQuery, request: ModuleRequest) => {
  return request(`/api/v1/artist/${query.id}`, {}, createOption(query, 'weapi'))
}

/**
 * 歌手单曲
 */
export default async function migratedArtists(
  query: ArtistQuery,
  request: ModuleRequest,
): Promise<NcmApiResponse> {
  try {
    return normalizeLegacyModuleResponse(await legacyModule(query, request))
  } catch (error) {
    throw normalizeLegacyModuleError(error)
  }
}
