import type { ModuleRequest, NcmApiResponse } from '../types/index.ts'
import type { LegacyModuleQuery } from '../types/modules.ts'
import { normalizeLegacyModuleError, normalizeLegacyModuleResponse } from './_migration.ts'
// 一起听 发送播放状态

import { createOption } from '../core/options.ts'
const legacyModule = (query: LegacyModuleQuery, request: ModuleRequest) => {
  const data = {
    roomId: query.roomId,
    commandInfo: JSON.stringify({
      commandType: query.commandType,
      progress: query.progress || 0,
      playStatus: query.playStatus,
      formerSongId: query.formerSongId,
      targetSongId: query.targetSongId,
      clientSeq: query.clientSeq,
    }),
  }
  return request(
    `/api/listen/together/play/command/report`,
    data,
    createOption(query),
  )
}

export default async function migratedListentogetherPlayCommand(query: LegacyModuleQuery, request: ModuleRequest): Promise<NcmApiResponse> {
  try {
    return normalizeLegacyModuleResponse(await legacyModule(query, request))
  } catch (error) {
    throw normalizeLegacyModuleError(error)
  }
}
