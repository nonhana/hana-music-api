// @ts-nocheck
// 此文件由 `scripts/migrate-modules.ts` 自动生成。
// 它的职责是保留旧模块行为，后续应按优先级逐步去掉 `@ts-nocheck` 并收紧类型。

import { normalizeLegacyModuleError, normalizeLegacyModuleResponse } from './_migration.ts'
// 黑胶时光机

import { createOption } from '../core/options.ts'
const legacyModule = (query, request) => {
  const data = {}
  if (query.startTime && query.endTime) {
    data.startTime = query.startTime
    data.endTime = query.endTime
    data.type = 1
    data.limit = query.limit || 60
  }
  return request(
    `/api/vipmusic/newrecord/weekflow`,
    data,
    createOption(query, 'weapi'),
  )
}

export default async function migratedVipTimemachine(query, request) {
  try {
    return normalizeLegacyModuleResponse(await legacyModule(query, request))
  } catch (error) {
    throw normalizeLegacyModuleError(error)
  }
}
