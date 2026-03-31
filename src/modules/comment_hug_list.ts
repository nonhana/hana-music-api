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
    cursor: query.cursor || '-1',
    threadId: threadId,
    pageNo: query.page || 1,
    idCursor: query.idCursor || -1,
    pageSize: query.pageSize || 100,
  }
  return request(`/api/v2/resource/comments/hug/list`, data, createOption(query))
}

export default async function migratedCommentHugList(
  query: LegacyModuleQuery,
  request: ModuleRequest,
): Promise<NcmApiResponse> {
  try {
    return normalizeLegacyModuleResponse(await legacyModule(query, request))
  } catch (error) {
    throw normalizeLegacyModuleError(error)
  }
}
