import type { ModuleRequest, NcmApiResponse } from '../types/index.ts'
import type { LegacyModuleQuery } from '../types/modules.ts'
import { normalizeLegacyModuleError, normalizeLegacyModuleResponse } from './_migration.ts'
// 用户详情

import { createOption } from '../core/options.ts'
const legacyModule = async (query: LegacyModuleQuery, request: ModuleRequest) => {
  const res = await request(
    `/api/v1/user/detail/${query.uid}`,
    {},
    createOption(query, 'weapi'),
  )
  const result = JSON.stringify(res).replace(
    /avatarImgId_str/g,
    'avatarImgIdStr',
  )
  return JSON.parse(result)
}

export default async function migratedUserDetail(query: LegacyModuleQuery, request: ModuleRequest): Promise<NcmApiResponse> {
  try {
    return normalizeLegacyModuleResponse(await legacyModule(query, request))
  } catch (error) {
    throw normalizeLegacyModuleError(error)
  }
}
