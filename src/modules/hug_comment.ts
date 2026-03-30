import type { ModuleRequest, NcmApiResponse } from '../types/index.ts'
import type { LegacyModuleQuery } from '../types/modules.ts'

import { RESOURCE_TYPE_MAP as resourceTypeMap } from '../core/config.ts'
import { createOption } from '../core/options.ts'
import { normalizeLegacyModuleError, normalizeLegacyModuleResponse } from './_migration.ts'
const legacyModule = (query: LegacyModuleQuery, request: ModuleRequest) => {
  query.type = resourceTypeMap[Number(query.type ?? 0) as keyof typeof resourceTypeMap]
  const threadId = `${String(query.type ?? '')}${String(query.sid ?? '')}`
  const data = {
    targetUserId: query.uid,
    commentId: query.cid,
    threadId: threadId,
  }
  return request(`/api/v2/resource/comments/hug/listener`, data, createOption(query))
}

export default async function migratedHugComment(
  query: LegacyModuleQuery,
  request: ModuleRequest,
): Promise<NcmApiResponse> {
  try {
    return normalizeLegacyModuleResponse(await legacyModule(query, request))
  } catch (error) {
    throw normalizeLegacyModuleError(error)
  }
}
