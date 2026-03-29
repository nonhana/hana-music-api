// @ts-nocheck
// 此文件由 `scripts/migrate-modules.ts` 自动生成。
// 它的职责是保留旧模块行为，后续应按优先级逐步去掉 `@ts-nocheck` 并收紧类型。

import { normalizeLegacyModuleError, normalizeLegacyModuleResponse } from './_migration.ts'
import { RESOURCE_TYPE_MAP as resourceTypeMap } from '../core/config.ts'
// 点赞与取消点赞评论

import { createOption } from '../core/options.ts'
const legacyModule = (query, request) => {
  query.t = query.t == 1 ? 'like' : 'unlike'
  query.type = resourceTypeMap[query.type]
  const data = {
    threadId: query.type + query.id,
    commentId: query.cid,
  }
  if (query.type == 'A_EV_2_') {
    data.threadId = query.threadId
  }
  return request(
    `/api/v1/comment/${query.t}`,
    data,
    createOption(query, 'weapi'),
  )
}

export default async function migratedCommentLike(query, request) {
  try {
    return normalizeLegacyModuleResponse(await legacyModule(query, request))
  } catch (error) {
    throw normalizeLegacyModuleError(error)
  }
}
