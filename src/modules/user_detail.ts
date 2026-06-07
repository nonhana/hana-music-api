import type { ModuleRequest, NcmApiResponse } from '../types/index.ts'
import type { UserDetailQuery } from '../types/modules.ts'

import { createOption } from '../core/options.ts'
import { normalizeLegacyModuleError, normalizeLegacyModuleResponse } from './_migration.ts'

const legacyModule = async (query: UserDetailQuery, request: ModuleRequest) => {
  const res = await request(`/api/v1/user/detail/${query.uid}`, {}, createOption(query, 'weapi'))
  const result = JSON.stringify(res).replace(/avatarImgId_str/g, 'avatarImgIdStr')
  return JSON.parse(result)
}

/**
 * 用户详情
 */
export default async function migratedUserDetail(
  query: UserDetailQuery,
  request: ModuleRequest,
): Promise<NcmApiResponse> {
  try {
    return normalizeLegacyModuleResponse(await legacyModule(query, request))
  } catch (error) {
    throw normalizeLegacyModuleError(error)
  }
}
