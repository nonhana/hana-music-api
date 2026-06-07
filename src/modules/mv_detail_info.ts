import type { ModuleRequest, NcmApiResponse } from '../types/index.ts'
import type { LegacyModuleQuery } from '../types/modules.ts'

import { createOption } from '../core/options.ts'
import { normalizeLegacyModuleError, normalizeLegacyModuleResponse } from './_migration.ts'

const legacyModule = (query: LegacyModuleQuery, request: ModuleRequest) => {
  const data = {
    threadid: `R_MV_5_${query.mvid}`,
    composeliked: true,
  }
  return request(`/api/comment/commentthread/info`, data, createOption(query, 'weapi'))
}

/**
 * MV 点赞转发评论数数据
 */
export default async function migratedMvDetailInfo(
  query: LegacyModuleQuery,
  request: ModuleRequest,
): Promise<NcmApiResponse> {
  try {
    return normalizeLegacyModuleResponse(await legacyModule(query, request))
  } catch (error) {
    throw normalizeLegacyModuleError(error)
  }
}
