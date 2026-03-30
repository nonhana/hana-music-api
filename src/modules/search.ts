import type { ModuleRequest, NcmApiResponse } from '../types/index.ts'
import type { SearchQuery } from '../types/modules.ts'

import { createOption } from '../core/options.ts'
// 搜索
import { normalizeLegacyModuleError, normalizeLegacyModuleResponse } from './_migration.ts'
const legacyModule = (query: SearchQuery, request: ModuleRequest) => {
  if (String(query.type ?? '') === '2000') {
    const data = {
      keyword: query.keywords,
      scene: 'normal',
      limit: query.limit || 30,
      offset: query.offset || 0,
    }
    return request(`/api/search/voice/get`, data, createOption(query))
  }
  const data = {
    s: query.keywords,
    type: query.type || 1, // 1: 单曲, 10: 专辑, 100: 歌手, 1000: 歌单, 1002: 用户, 1004: MV, 1006: 歌词, 1009: 电台, 1014: 视频
    limit: query.limit || 30,
    offset: query.offset || 0,
  }
  return request(`/api/search/get`, data, createOption(query))
}

export default async function migratedSearch(
  query: SearchQuery,
  request: ModuleRequest,
): Promise<NcmApiResponse> {
  try {
    return normalizeLegacyModuleResponse(await legacyModule(query, request))
  } catch (error) {
    throw normalizeLegacyModuleError(error)
  }
}
