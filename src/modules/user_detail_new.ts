import type { ModuleRequest, NcmApiResponse } from '../types/index.ts'
import type { LegacyModuleQuery } from '../types/modules.ts'
import { normalizeLegacyModuleError, normalizeLegacyModuleResponse } from './_migration.ts'
// 用户详情

import { createOption } from '../core/options.ts'
const legacyModule = async (query: LegacyModuleQuery, request: ModuleRequest) => {
  const data = {
    all: 'true',
    userId: query.uid,
  }
  const res = await request(
    `/api/w/v1/user/detail/${query.uid}`,
    data,
    createOption(query, 'eapi'),
  )
  // const result = JSON.stringify(res).replace(
  //   /avatarImgId_str/g,
  //   "avatarImgIdStr"
  // );
  // return JSON.parse(result);
  return res
}

export default async function migratedUserDetailNew(query: LegacyModuleQuery, request: ModuleRequest): Promise<NcmApiResponse> {
  try {
    return normalizeLegacyModuleResponse(await legacyModule(query, request))
  } catch (error) {
    throw normalizeLegacyModuleError(error)
  }
}
