// @ts-nocheck
// 此文件由 `scripts/migrate-modules.ts` 自动生成。
// 它的职责是保留旧模块行为，后续应按优先级逐步去掉 `@ts-nocheck` 并收紧类型。

import { normalizeLegacyModuleError, normalizeLegacyModuleResponse } from './_migration.ts'
// 每日推荐歌曲-不感兴趣
import { createOption } from '../core/options.ts'
const legacyModule = (query, request) => {
  const data = {
    resId: query.id, // 日推歌曲id
    resType: 4,
    sceneType: 1,
  }
  return request(
    `/api/v2/discovery/recommend/dislike`,
    data,
    createOption(query, 'weapi'),
  )
}

export default async function migratedRecommendSongsDislike(query, request) {
  try {
    return normalizeLegacyModuleResponse(await legacyModule(query, request))
  } catch (error) {
    throw normalizeLegacyModuleError(error)
  }
}
