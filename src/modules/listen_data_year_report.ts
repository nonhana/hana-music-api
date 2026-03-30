import type { ModuleRequest, NcmApiResponse } from '../types/index.ts'
import type { LegacyModuleQuery } from '../types/modules.ts'
import { normalizeLegacyModuleError, normalizeLegacyModuleResponse } from './_migration.ts'
// 听歌足迹 - 年度听歌足迹
import { createOption } from '../core/options.ts'
const legacyModule = (query: LegacyModuleQuery, request: ModuleRequest) => {
  return request(
    `/api/content/activity/listen/data/year/report`,
    {},
    createOption(query),
  )
}

export default async function migratedListenDataYearReport(query: LegacyModuleQuery, request: ModuleRequest): Promise<NcmApiResponse> {
  try {
    return normalizeLegacyModuleResponse(await legacyModule(query, request))
  } catch (error) {
    throw normalizeLegacyModuleError(error)
  }
}
