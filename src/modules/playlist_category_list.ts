import type { ModuleRequest, NcmApiResponse } from '../types/index.ts'
import type { LegacyModuleQuery } from '../types/modules.ts'

import { createOption } from '../core/options.ts'
import { normalizeLegacyModuleError, normalizeLegacyModuleResponse } from './_migration.ts'

const legacyModule = (query: LegacyModuleQuery, request: ModuleRequest) => {
  const data = {
    cat: query.cat || '全部',
    limit: query.limit || 24,
    newStyle: true,
  }
  return request(`/api/playlist/category/list`, data, createOption(query))
}

/**
 * 歌单分类列表
 */
export default async function migratedPlaylistCategoryList(
  query: LegacyModuleQuery,
  request: ModuleRequest,
): Promise<NcmApiResponse> {
  try {
    return normalizeLegacyModuleResponse(await legacyModule(query, request))
  } catch (error) {
    throw normalizeLegacyModuleError(error)
  }
}
