import type { ModuleRequest, NcmApiResponse } from '../types/index.ts'
import type { CommentLikeQuery } from '../types/modules.ts'

import { createOption } from '../core/options.ts'
import { normalizeLegacyModuleError, normalizeLegacyModuleResponse } from './_migration.ts'
// 点赞与取消点赞评论
import { resolveResourceType } from './_module-inputs.ts'
const legacyModule = (query: CommentLikeQuery, request: ModuleRequest) => {
  const action = Number(query.t) === 1 ? 'like' : 'unlike'
  const resourceType = resolveResourceType(query.type)
  const data: Record<string, unknown> = {
    threadId: `${resourceType}${String(query.id)}`,
    commentId: query.cid,
  }
  if (resourceType === 'A_EV_2_') {
    data.threadId = query.threadId
  }
  return request(`/api/v1/comment/${action}`, data, createOption(query, 'weapi'))
}

export default async function migratedCommentLike(
  query: CommentLikeQuery,
  request: ModuleRequest,
): Promise<NcmApiResponse> {
  try {
    return normalizeLegacyModuleResponse(await legacyModule(query, request))
  } catch (error) {
    throw normalizeLegacyModuleError(error)
  }
}
