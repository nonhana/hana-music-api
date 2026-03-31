import type { ModuleRequest, NcmApiResponse } from '../types/index.ts'
import type { CommentNewQuery } from '../types/modules.ts'

import { createOption } from '../core/options.ts'
import { normalizeLegacyModuleError, normalizeLegacyModuleResponse } from './_migration.ts'
// 评论
import { resolveResourceType } from './_module-inputs.ts'
const legacyModule = (query: CommentNewQuery, request: ModuleRequest) => {
  const resourceType = resolveResourceType(query.type)
  const threadId = `${resourceType}${String(query.id)}`
  const pageSize = Number(query.pageSize ?? 20) || 20
  const pageNo = Number(query.pageNo ?? 1) || 1
  let sortType = Number(query.sortType) || 99
  if (sortType === 1) {
    sortType = 99
  }
  let cursor = ''
  switch (sortType) {
    case 99:
      cursor = String((pageNo - 1) * pageSize)
      break
    case 2:
      cursor = 'normalHot#' + String((pageNo - 1) * pageSize)
      break
    case 3:
      cursor = query.cursor || '0'
      break
    default:
      break
  }
  const data = {
    threadId: threadId,
    pageNo,
    showInner: query.showInner || true,
    pageSize,
    cursor: cursor,
    sortType: sortType, //99:按推荐排序,2:按热度排序,3:按时间排序
  }
  return request(`/api/v2/resource/comments`, data, createOption(query))
}

export default async function migratedCommentNew(
  query: CommentNewQuery,
  request: ModuleRequest,
): Promise<NcmApiResponse> {
  try {
    return normalizeLegacyModuleResponse(await legacyModule(query, request))
  } catch (error) {
    throw normalizeLegacyModuleError(error)
  }
}
