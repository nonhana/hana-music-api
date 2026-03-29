// @ts-nocheck
// 此文件由 `scripts/migrate-modules.ts` 自动生成。
// 它的职责是保留旧模块行为，后续应按优先级逐步去掉 `@ts-nocheck` 并收紧类型。

import { normalizeLegacyModuleError, normalizeLegacyModuleResponse } from './_migration.ts'
import { RESOURCE_TYPE_MAP as resourceTypeMap } from '../core/config.ts'
// 评论

import { createOption } from '../core/options.ts'
const legacyModule = (query, request) => {
  query.type = resourceTypeMap[query.type]
  const threadId = query.type + query.id
  const pageSize = query.pageSize || 20
  const pageNo = query.pageNo || 1
  let sortType = Number(query.sortType) || 99
  if (sortType === 1) {
    sortType = 99
  }
  let cursor = ''
  switch (sortType) {
    case 99:
      cursor = (pageNo - 1) * pageSize
      break
    case 2:
      cursor = 'normalHot#' + (pageNo - 1) * pageSize
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

export default async function migratedCommentNew(query, request) {
  try {
    return normalizeLegacyModuleResponse(await legacyModule(query, request))
  } catch (error) {
    throw normalizeLegacyModuleError(error)
  }
}
