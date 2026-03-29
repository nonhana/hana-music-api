// @ts-nocheck
// 此文件由 `scripts/migrate-modules.ts` 自动生成。
// 它的职责是保留旧模块行为，后续应按优先级逐步去掉 `@ts-nocheck` 并收紧类型。

import { normalizeLegacyModuleError, normalizeLegacyModuleResponse } from './_migration.ts'
// 广播电台 - 收藏/取消收藏电台

import { createOption } from '../core/options.ts'
const legacyModule = (query, request) => {
  query.t = query.t == 1 ? 'false' : 'true'
  const data = {
    contentType: 'BROADCAST',
    contentId: query.id,
    cancelCollect: query.t,
  }
  return request(`/api/content/interact/collect`, data, createOption(query))
}

export default async function migratedBroadcastSub(query, request) {
  try {
    return normalizeLegacyModuleResponse(await legacyModule(query, request))
  } catch (error) {
    throw normalizeLegacyModuleError(error)
  }
}
