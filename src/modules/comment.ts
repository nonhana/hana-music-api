import type { ModuleRequest, NcmApiResponse } from '../types/index.ts'
import type { LegacyModuleQuery } from '../types/modules.ts'

import { RESOURCE_TYPE_MAP as resourceTypeMap } from '../core/config.ts'
import { createOption } from '../core/options.ts'
// 发送与删除评论
import { normalizeLegacyModuleError, normalizeLegacyModuleResponse } from './_migration.ts'
const legacyModule = (query: LegacyModuleQuery, request: ModuleRequest) => {
  const actionMap: Record<number, string> = {
    1: 'add',
    0: 'delete',
    2: 'reply',
  }
  query.t = actionMap[Number(query.t ?? 0)] ?? 'add'
  query.type = resourceTypeMap[Number(query.type ?? 0) as keyof typeof resourceTypeMap]
  const data: Record<string, unknown> = {
    threadId: `${String(query.type ?? '')}${String(query.id ?? '')}`,
  }

  if (query.type === 'A_EV_2_') {
    data.threadId = query.threadId
  }
  if (query.t === 'add') data.content = query.content
  else if (query.t === 'delete') data.commentId = query.commentId
  else if (query.t === 'reply') {
    data.commentId = query.commentId
    data.content = query.content
  }
  return request(`/api/resource/comments/${query.t}`, data, createOption(query, 'weapi'))
}

export default async function migratedComment(
  query: LegacyModuleQuery,
  request: ModuleRequest,
): Promise<NcmApiResponse> {
  try {
    return normalizeLegacyModuleResponse(await legacyModule(query, request))
  } catch (error) {
    throw normalizeLegacyModuleError(error)
  }
}
