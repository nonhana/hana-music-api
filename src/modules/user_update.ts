import type { ModuleRequest, NcmApiResponse } from '../types/index.ts'
import type { LegacyModuleQuery } from '../types/modules.ts'

import { createOption } from '../core/options.ts'
import { normalizeLegacyModuleError, normalizeLegacyModuleResponse } from './_migration.ts'

const legacyModule = (query: LegacyModuleQuery, request: ModuleRequest) => {
  const data = {
    // avatarImgId: '0',
    birthday: query.birthday,
    city: query.city,
    gender: query.gender,
    nickname: query.nickname,
    province: query.province,
    signature: query.signature,
  }
  return request(`/api/user/profile/update`, data, createOption(query))
}

/**
 * 编辑用户信息
 */
export default async function migratedUserUpdate(
  query: LegacyModuleQuery,
  request: ModuleRequest,
): Promise<NcmApiResponse> {
  try {
    return normalizeLegacyModuleResponse(await legacyModule(query, request))
  } catch (error) {
    throw normalizeLegacyModuleError(error)
  }
}
