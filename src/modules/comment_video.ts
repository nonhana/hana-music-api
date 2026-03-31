import type { ModuleRequest, NcmApiResponse } from '../types/index.ts'
import type { CommentThreadQuery } from '../types/modules.ts'

import { createOption } from '../core/options.ts'
// 视频评论
import { normalizeLegacyModuleError, normalizeLegacyModuleResponse } from './_migration.ts'
const legacyModule = (query: CommentThreadQuery, request: ModuleRequest) => {
  const data = {
    rid: query.id,
    limit: query.limit || 20,
    offset: query.offset || 0,
    beforeTime: query.before || 0,
  }
  return request(
    `/api/v1/resource/comments/R_VI_62_${query.id}`,
    data,
    createOption(query, 'weapi'),
  )
}

export default async function migratedCommentVideo(
  query: CommentThreadQuery,
  request: ModuleRequest,
): Promise<NcmApiResponse> {
  try {
    return normalizeLegacyModuleResponse(await legacyModule(query, request))
  } catch (error) {
    throw normalizeLegacyModuleError(error)
  }
}
