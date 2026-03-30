import type { ModuleRequest, NcmApiResponse } from '../types/index.ts'
import type { LegacyModuleQuery } from '../types/modules.ts'
import { normalizeLegacyModuleError, normalizeLegacyModuleResponse } from './_migration.ts'
// 一起听创建房间

import { createOption } from '../core/options.ts'
const legacyModule = (query: LegacyModuleQuery, request: ModuleRequest) => {
  const data = {
    refer: 'songplay_more',
  }
  return request(`/api/listen/together/room/create`, data, createOption(query))
}

export default async function migratedListentogetherRoomCreate(query: LegacyModuleQuery, request: ModuleRequest): Promise<NcmApiResponse> {
  try {
    return normalizeLegacyModuleResponse(await legacyModule(query, request))
  } catch (error) {
    throw normalizeLegacyModuleError(error)
  }
}
