// @ts-nocheck
// 此文件由 `scripts/migrate-modules.ts` 自动生成。
// 它的职责是保留旧模块行为，后续应按优先级逐步去掉 `@ts-nocheck` 并收紧类型。

import { normalizeLegacyModuleError, normalizeLegacyModuleResponse } from './_migration.ts'
import { RESOURCE_TYPE_MAP as resourceTypeMap } from '../core/config.ts'
import { createOption } from '../core/options.ts'
const legacyModule = (query, request) => {
  query.type = resourceTypeMap[query.type || 0]
  const threadId = query.type + query.sid
  const data = {
    targetUserId: query.uid,
    commentId: query.cid,
    cursor: query.cursor || '-1',
    threadId: threadId,
    pageNo: query.page || 1,
    idCursor: query.idCursor || -1,
    pageSize: query.pageSize || 100,
  }
  return request(
    `/api/v2/resource/comments/hug/list`,
    data,
    createOption(query),
  )
}

export default async function migratedCommentHugList(query, request) {
  try {
    return normalizeLegacyModuleResponse(await legacyModule(query, request))
  } catch (error) {
    throw normalizeLegacyModuleError(error)
  }
}
