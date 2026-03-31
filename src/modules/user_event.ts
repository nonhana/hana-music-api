import type { ModuleRequest, NcmApiResponse } from '../types/index.ts'
import type { UserEventQuery } from '../types/modules.ts'

import { createOption } from '../core/options.ts'
// 用户动态
import { normalizeLegacyModuleError, normalizeLegacyModuleResponse } from './_migration.ts'
const legacyModule = (query: UserEventQuery, request: ModuleRequest) => {
  const data = {
    getcounts: true,
    time: query.lasttime || -1,
    limit: query.limit || 30,
    total: false,
  }
  return request(`/api/event/get/${query.uid}`, data, createOption(query))
}

export default async function migratedUserEvent(
  query: UserEventQuery,
  request: ModuleRequest,
): Promise<NcmApiResponse> {
  try {
    return normalizeLegacyModuleResponse(await legacyModule(query, request))
  } catch (error) {
    throw normalizeLegacyModuleError(error)
  }
}
