import type { ModuleRequest, NcmApiResponse } from '../types/index.ts'
import type { LegacyModuleQuery } from '../types/modules.ts'

import { createOption } from '../core/options.ts'
import { normalizeLegacyModuleError, normalizeLegacyModuleResponse } from './_migration.ts'

const legacyModule = (query: LegacyModuleQuery, request: ModuleRequest) => {
  query.t = Number(query.t) === 1 ? 'sub' : 'unsub'
  const data = {
    id: query.rid,
  }
  return request(`/api/djradio/${query.t}`, data, createOption(query, 'weapi'))
}

/**
 * 订阅与取消电台
 */
export default async function migratedDjSub(
  query: LegacyModuleQuery,
  request: ModuleRequest,
): Promise<NcmApiResponse> {
  try {
    return normalizeLegacyModuleResponse(await legacyModule(query, request))
  } catch (error) {
    throw normalizeLegacyModuleError(error)
  }
}
