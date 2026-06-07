import type { ModuleRequest, NcmApiResponse } from '../types/index.ts'
import type { LegacyModuleQuery } from '../types/modules.ts'

import { createOption } from '../core/options.ts'
import { normalizeLegacyModuleError, normalizeLegacyModuleResponse } from './_migration.ts'

const legacyModule = (query: LegacyModuleQuery, request: ModuleRequest) => {
  const data = {
    cateId: query.cateId,
    limit: query.limit || 30,
    offset: query.offset || 0,
  }
  return request(`/api/djradio/hot`, data, createOption(query, 'weapi'))
}

/**
 * 类别热门电台
 */
export default async function migratedDjRadioHot(
  query: LegacyModuleQuery,
  request: ModuleRequest,
): Promise<NcmApiResponse> {
  try {
    return normalizeLegacyModuleResponse(await legacyModule(query, request))
  } catch (error) {
    throw normalizeLegacyModuleError(error)
  }
}
