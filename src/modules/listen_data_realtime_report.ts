// @ts-nocheck
// 此文件由 `scripts/migrate-modules.ts` 自动生成。
// 它的职责是保留旧模块行为，后续应按优先级逐步去掉 `@ts-nocheck` 并收紧类型。

import { normalizeLegacyModuleError, normalizeLegacyModuleResponse } from './_migration.ts'
// 听歌足迹 - 本周/本月收听时长
import { createOption } from '../core/options.ts'
const legacyModule = (query, request) => {
  return request(
    `/api/content/activity/listen/data/realtime/report`,
    {
      type: query.type || 'week', //周 week 月 month
    },
    createOption(query),
  )
}

export default async function migratedListenDataRealtimeReport(query, request) {
  try {
    return normalizeLegacyModuleResponse(await legacyModule(query, request))
  } catch (error) {
    throw normalizeLegacyModuleError(error)
  }
}
