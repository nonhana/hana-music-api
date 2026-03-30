import type { ModuleRequest, NcmApiResponse } from '../types/index.ts'
import type { LegacyModuleQuery } from '../types/modules.ts'
import { normalizeLegacyModuleError, normalizeLegacyModuleResponse } from './_migration.ts'
// 创建歌单

import { createOption } from '../core/options.ts'
const legacyModule = (query: LegacyModuleQuery, request: ModuleRequest) => {
  const data = {
    name: query.name,
    privacy: query.privacy || '0', // 0 普通歌单, 10 隐私歌单
    type: query.type || 'NORMAL', // 默认 NORMAL, VIDEO 视频歌单, SHARED 共享歌单
  }
  return request(`/api/playlist/create`, data, createOption(query, 'weapi'))
}

export default async function migratedPlaylistCreate(query: LegacyModuleQuery, request: ModuleRequest): Promise<NcmApiResponse> {
  try {
    return normalizeLegacyModuleResponse(await legacyModule(query, request))
  } catch (error) {
    throw normalizeLegacyModuleError(error)
  }
}
