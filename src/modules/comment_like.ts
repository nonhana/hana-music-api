import type { ModuleRequest, NcmApiResponse } from '../types/index.ts'
import type { LegacyModuleQuery } from '../types/modules.ts'

import { createOption } from '../core/options.ts'
import { normalizeLegacyModuleError, normalizeLegacyModuleResponse } from './_migration.ts'
// 点赞与取消点赞评论
import { resolveResourceType } from './_module-inputs.ts'
const legacyModule = (query: LegacyModuleQuery, request: ModuleRequest) => {
  query.t = Number(query.t) === 1 ? 'like' : 'unlike'
  query.type = resolveResourceType(query.type)
  const data: Record<string, unknown> = {
    threadId: `${String(query.type ?? '')}${String(query.id ?? '')}`,
    commentId: query.cid,
  }
  if (query.type === 'A_EV_2_') {
    data.threadId = query.threadId
  }
  return request(`/api/v1/comment/${query.t}`, data, createOption(query, 'weapi'))
}

export default async function migratedCommentLike(
  query: LegacyModuleQuery,
  request: ModuleRequest,
): Promise<NcmApiResponse> {
  try {
    return normalizeLegacyModuleResponse(await legacyModule(query, request))
  } catch (error) {
    throw normalizeLegacyModuleError(error)
  }
}
