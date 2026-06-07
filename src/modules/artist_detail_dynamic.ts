import type { ModuleRequest, NcmApiResponse } from '../types/index.ts'
import type { ArtistQuery } from '../types/modules.ts'

import { createOption } from '../core/options.ts'
import { normalizeLegacyModuleError, normalizeLegacyModuleResponse } from './_migration.ts'

const legacyModule = (query: ArtistQuery, request: ModuleRequest) => {
  const data = {
    id: query.id,
  }
  return request(`/api/artist/detail/dynamic`, data, createOption(query))
}

/**
 * 歌手动态信息
 */
export default async function migratedArtistDetailDynamic(
  query: ArtistQuery,
  request: ModuleRequest,
): Promise<NcmApiResponse> {
  try {
    return normalizeLegacyModuleResponse(await legacyModule(query, request))
  } catch (error) {
    throw normalizeLegacyModuleError(error)
  }
}
