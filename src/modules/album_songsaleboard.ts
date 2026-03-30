import type { ModuleRequest, NcmApiResponse } from '../types/index.ts'
import type { LegacyModuleQuery } from '../types/modules.ts'

// 数字专辑&数字单曲-榜单
import { createOption } from '../core/options.ts'
import { normalizeLegacyModuleError, normalizeLegacyModuleResponse } from './_migration.ts'
const legacyModule = (query: LegacyModuleQuery, request: ModuleRequest) => {
  let data: Record<string, unknown> = {
    albumType: query.albumType || 0, //0为数字专辑,1为数字单曲
  }
  const type = query.type || 'daily' // daily,week,year,total
  if (type === 'year') {
    data = {
      ...data,
      year: query.year,
    }
  }
  return request(`/api/feealbum/songsaleboard/${type}/type`, data, createOption(query, 'weapi'))
}

export default async function migratedAlbumSongsaleboard(
  query: LegacyModuleQuery,
  request: ModuleRequest,
): Promise<NcmApiResponse> {
  try {
    return normalizeLegacyModuleResponse(await legacyModule(query, request))
  } catch (error) {
    throw normalizeLegacyModuleError(error)
  }
}
