import type { ModuleRequest, NcmApiResponse } from '../types/index.ts'
import type { CommentFloorQuery } from '../types/modules.ts'

import { createOption } from '../core/options.ts'
import { normalizeLegacyModuleError, normalizeLegacyModuleResponse } from './_migration.ts'
import { resolveResourceType } from './_module-inputs.ts'
const legacyModule = (query: CommentFloorQuery, request: ModuleRequest) => {
  const resourceType = resolveResourceType(query.type)
  const data = {
    parentCommentId: query.parentCommentId,
    threadId: `${resourceType}${String(query.id)}`,
    time: query.time || -1,
    limit: query.limit || 20,
  }
  return request(`/api/resource/comment/floor/get`, data, createOption(query, 'weapi'))
}

export default async function migratedCommentFloor(
  query: CommentFloorQuery,
  request: ModuleRequest,
): Promise<NcmApiResponse> {
  try {
    return normalizeLegacyModuleResponse(await legacyModule(query, request))
  } catch (error) {
    throw normalizeLegacyModuleError(error)
  }
}
