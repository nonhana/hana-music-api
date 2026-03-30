import type { ModuleRequest, NcmApiResponse } from '../types/index.ts'
import type { LegacyModuleQuery } from '../types/modules.ts'
import { normalizeLegacyModuleError, normalizeLegacyModuleResponse } from './_migration.ts'
// 全部视频列表

import { createOption } from '../core/options.ts'
const legacyModule = (query: LegacyModuleQuery, request: ModuleRequest) => {
  const data = {
    groupId: 0,
    offset: query.offset || 0,
    need_preview_url: 'true',
    total: true,
  }
  //   /api/videotimeline/otherclient/get
  return request(
    `/api/videotimeline/otherclient/get`,
    data,
    createOption(query, 'weapi'),
  )
}

export default async function migratedVideoTimelineAll(query: LegacyModuleQuery, request: ModuleRequest): Promise<NcmApiResponse> {
  try {
    return normalizeLegacyModuleResponse(await legacyModule(query, request))
  } catch (error) {
    throw normalizeLegacyModuleError(error)
  }
}
