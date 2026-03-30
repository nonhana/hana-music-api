import type { ModuleRequest, NcmApiResponse } from '../types/index.ts'
import type { LegacyModuleQuery } from '../types/modules.ts'
import { normalizeLegacyModuleError, normalizeLegacyModuleResponse } from './_migration.ts'
// 用户状态
import { createOption } from '../core/options.ts'
const legacyModule = (query: LegacyModuleQuery, request: ModuleRequest) => {
  return request(
    `/api/social/user/status`,
    {
      visitorId: query.uid,
    },
    createOption(query),
  )
}

export default async function migratedUserSocialStatus(query: LegacyModuleQuery, request: ModuleRequest): Promise<NcmApiResponse> {
  try {
    return normalizeLegacyModuleResponse(await legacyModule(query, request))
  } catch (error) {
    throw normalizeLegacyModuleError(error)
  }
}
