import type { ModuleRequest, NcmApiResponse } from '../types/index.ts'
import type { CommentQuery } from '../types/modules.ts'

import { createOption } from '../core/options.ts'
import { normalizeLegacyModuleError, normalizeLegacyModuleResponse } from './_migration.ts'
// 发送与删除评论
import { resolveResourceType } from './_module-inputs.ts'
const legacyModule = (query: CommentQuery, request: ModuleRequest) => {
  const actionMap: Record<number, string> = {
    1: 'add',
    0: 'delete',
    2: 'reply',
  }
  const action = actionMap[Number(query.t ?? 0)] ?? 'add'
  const resourceType = resolveResourceType(query.type)
  const data: Record<string, unknown> = {
    threadId: `${resourceType}${String(query.id)}`,
  }

  if (resourceType === 'A_EV_2_') {
    data.threadId = query.threadId
  }
  if (action === 'add') data.content = query.content
  else if (action === 'delete') data.commentId = query.commentId
  else if (action === 'reply') {
    data.commentId = query.commentId
    data.content = query.content
  }
  return request(`/api/resource/comments/${action}`, data, createOption(query, 'weapi'))
}

export default async function migratedComment(
  query: CommentQuery,
  request: ModuleRequest,
): Promise<NcmApiResponse> {
  try {
    return normalizeLegacyModuleResponse(await legacyModule(query, request))
  } catch (error) {
    throw normalizeLegacyModuleError(error)
  }
}
