import type { ModuleRequest, NcmApiResponse } from '../types/index.ts'
import type { ArtistSublistQuery } from '../types/modules.ts'

import { createOption } from '../core/options.ts'
// 关注歌手列表
import { normalizeLegacyModuleError, normalizeLegacyModuleResponse } from './_migration.ts'
const legacyModule = (query: ArtistSublistQuery, request: ModuleRequest) => {
  const data = {
    limit: query.limit || 25,
    offset: query.offset || 0,
    total: true,
  }
  return request(`/api/artist/sublist`, data, createOption(query, 'weapi'))
}

export default async function migratedArtistSublist(
  query: ArtistSublistQuery,
  request: ModuleRequest,
): Promise<NcmApiResponse> {
  try {
    return normalizeLegacyModuleResponse(await legacyModule(query, request))
  } catch (error) {
    throw normalizeLegacyModuleError(error)
  }
}
