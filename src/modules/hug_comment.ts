import type { ModuleRequest, NcmApiResponse } from '../types/index.ts'
import type { LegacyModuleQuery } from '../types/modules.ts'

import { createOption } from '../core/options.ts'
import { normalizeLegacyModuleError, normalizeLegacyModuleResponse } from './_migration.ts'
import { resolveResourceType } from './_module-inputs.ts'
const legacyModule = (query: LegacyModuleQuery, request: ModuleRequest) => {
  query.type = resolveResourceType(query.type)
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
