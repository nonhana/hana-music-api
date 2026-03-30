import type { ModuleRequest, NcmApiResponse } from '../types/index.ts'
import type { LegacyModuleQuery } from '../types/modules.ts'

// 收藏与取消收藏歌单
import { APP_CONF } from '../core/config.ts'
import { createOption } from '../core/options.ts'
import { normalizeLegacyModuleError, normalizeLegacyModuleResponse } from './_migration.ts'
const legacyModule = (query: LegacyModuleQuery, request: ModuleRequest) => {
  const shouldSubscribe = Number(query.t) === 1
  const path = shouldSubscribe ? 'subscribe' : 'unsubscribe'
  const data = {
    id: query.id,
    ...(shouldSubscribe ? { checkToken: query.checkToken || APP_CONF.checkToken } : {}),
  }
  query.checkToken = true // 强制开启checkToken
  return request(`/api/playlist/${path}`, data, createOption(query, 'eapi'))
}

export default async function migratedPlaylistSubscribe(
  query: LegacyModuleQuery,
  request: ModuleRequest,
): Promise<NcmApiResponse> {
  try {
    return normalizeLegacyModuleResponse(await legacyModule(query, request))
  } catch (error) {
    throw normalizeLegacyModuleError(error)
  }
}
