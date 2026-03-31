import type { ModuleRequest, NcmApiResponse } from '../types/index.ts'
import type { CommentHotQuery } from '../types/modules.ts'

import { createOption } from '../core/options.ts'
import { normalizeLegacyModuleError, normalizeLegacyModuleResponse } from './_migration.ts'
// 热门评论
import { resolveResourceType } from './_module-inputs.ts'
const legacyModule = (query: CommentHotQuery, request: ModuleRequest) => {
  const resourceType = resolveResourceType(query.type)
  const data = {
    rid: query.id,
    limit: query.limit || 20,
    offset: query.offset || 0,
    beforeTime: query.before || 0,
  }
  return request(
    `/api/v1/resource/hotcomments/${resourceType}${String(query.id)}`,
    data,
    createOption(query, 'weapi'),
  )
}

export default async function migratedCommentHot(
  query: CommentHotQuery,
  request: ModuleRequest,
): Promise<NcmApiResponse> {
  try {
    return normalizeLegacyModuleResponse(await legacyModule(query, request))
  } catch (error) {
    throw normalizeLegacyModuleError(error)
  }
}
