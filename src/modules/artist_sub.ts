import type { ModuleRequest, NcmApiResponse } from '../types/index.ts'
import type { ArtistSubQuery } from '../types/modules.ts'

import { createOption } from '../core/options.ts'
// 收藏与取消收藏歌手
import { normalizeLegacyModuleError, normalizeLegacyModuleResponse } from './_migration.ts'
const legacyModule = (query: ArtistSubQuery, request: ModuleRequest) => {
  const action = Number(query.t) === 1 ? 'sub' : 'unsub'
  const data = {
    artistId: query.id,
    artistIds: '[' + query.id + ']',
  }
  return request(`/api/artist/${action}`, data, createOption(query, 'weapi'))
}

export default async function migratedArtistSub(
  query: ArtistSubQuery,
  request: ModuleRequest,
): Promise<NcmApiResponse> {
  try {
    return normalizeLegacyModuleResponse(await legacyModule(query, request))
  } catch (error) {
    throw normalizeLegacyModuleError(error)
  }
}
