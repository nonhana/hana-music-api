import type { ModuleRequest, NcmApiResponse } from '../types/index.ts'
import type { LegacyModuleQuery } from '../types/modules.ts'

import { createOption } from '../core/options.ts'
// 收藏单曲到歌单 从歌单删除歌曲
import { normalizeLegacyModuleError, normalizeLegacyModuleResponse } from './_migration.ts'
const legacyModule = async (query: LegacyModuleQuery, request: ModuleRequest) => {
  const ids = String(query.ids ?? '')
  const data = {
    id: query.id,
    tracks: JSON.stringify(
      ids.split(',').map((item: string) => {
        return { type: 3, id: item }
      }),
    ),
  }

  return request(`/api/playlist/track/delete`, data, createOption(query, 'weapi'))
}

export default async function migratedPlaylistTrackDelete(
  query: LegacyModuleQuery,
  request: ModuleRequest,
): Promise<NcmApiResponse> {
  try {
    return normalizeLegacyModuleResponse(await legacyModule(query, request))
  } catch (error) {
    throw normalizeLegacyModuleError(error)
  }
}
