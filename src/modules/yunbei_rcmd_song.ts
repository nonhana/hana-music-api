import type { ModuleRequest, NcmApiResponse } from '../types/index.ts'
import type { LegacyModuleQuery } from '../types/modules.ts'
import { normalizeLegacyModuleError, normalizeLegacyModuleResponse } from './_migration.ts'
// 云贝推歌

import { createOption } from '../core/options.ts'
const legacyModule = (query: LegacyModuleQuery, request: ModuleRequest) => {
  const data = {
    songId: query.id,
    reason: query.reason || '好歌献给你',
    scene: '',
    fromUserId: -1,
    yunbeiNum: query.yunbeiNum || 10,
  }
  return request(
    `/api/yunbei/rcmd/song/submit`,
    data,
    createOption(query, 'weapi'),
  )
}

export default async function migratedYunbeiRcmdSong(query: LegacyModuleQuery, request: ModuleRequest): Promise<NcmApiResponse> {
  try {
    return normalizeLegacyModuleResponse(await legacyModule(query, request))
  } catch (error) {
    throw normalizeLegacyModuleError(error)
  }
}
