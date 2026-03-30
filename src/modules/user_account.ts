import type { ModuleRequest, NcmApiResponse } from '../types/index.ts'
import type { UserAccountQuery } from '../types/modules.ts'

import { createOption } from '../core/options.ts'
import { normalizeLegacyModuleError, normalizeLegacyModuleResponse } from './_migration.ts'
const legacyModule = (query: UserAccountQuery, request: ModuleRequest) => {
  const data = {}
  return request(`/api/nuser/account/get`, data, createOption(query, 'weapi'))
}

export default async function migratedUserAccount(
  query: UserAccountQuery,
  request: ModuleRequest,
): Promise<NcmApiResponse> {
  try {
    return normalizeLegacyModuleResponse(await legacyModule(query, request))
  } catch (error) {
    throw normalizeLegacyModuleError(error)
  }
}
