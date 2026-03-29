// @ts-nocheck
// 此文件由 `scripts/migrate-modules.ts` 自动生成。
// 它的职责是保留旧模块行为，后续应按优先级逐步去掉 `@ts-nocheck` 并收紧类型。

import { normalizeLegacyModuleError, normalizeLegacyModuleResponse } from './_migration.ts'
import { RESOURCE_TYPE_MAP as resourceTypeMap } from '../core/config.ts'
// 发送与删除评论

import { createOption } from '../core/options.ts'
const legacyModule = (query, request) => {
  query.t = {
    1: 'add',
    0: 'delete',
    2: 'reply',
  }[query.t]
  query.type = resourceTypeMap[query.type]
  const data = {
    threadId: query.type + query.id,
  }

  if (query.type == 'A_EV_2_') {
    data.threadId = query.threadId
  }
  if (query.t == 'add') data.content = query.content
  else if (query.t == 'delete') data.commentId = query.commentId
  else if (query.t == 'reply') {
    data.commentId = query.commentId
    data.content = query.content
  }
  return request(
    `/api/resource/comments/${query.t}`,
    data,
    createOption(query, 'weapi'),
  )
}

export default async function migratedComment(query, request) {
  try {
    return normalizeLegacyModuleResponse(await legacyModule(query, request))
  } catch (error) {
    throw normalizeLegacyModuleError(error)
  }
}
