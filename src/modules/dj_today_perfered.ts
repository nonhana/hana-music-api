import type { ModuleRequest, NcmApiResponse } from '../types/index.ts'
import type { LegacyModuleQuery } from '../types/modules.ts'
import { normalizeLegacyModuleError, normalizeLegacyModuleResponse } from './_migration.ts'
// 电台今日优选

import { createOption } from '../core/options.ts'
const legacyModule = (query: LegacyModuleQuery, request: ModuleRequest) => {
  const data = {
    page: query.page || 0,
  }
  return request(
    `/api/djradio/home/today/perfered`,
    data,
    createOption(query, 'weapi'),
  )
}

export default async function migratedDjTodayPerfered(query: LegacyModuleQuery, request: ModuleRequest): Promise<NcmApiResponse> {
  try {
    return normalizeLegacyModuleResponse(await legacyModule(query, request))
  } catch (error) {
    throw normalizeLegacyModuleError(error)
  }
}
