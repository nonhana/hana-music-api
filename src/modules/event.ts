// @ts-nocheck
// 此文件由 `scripts/migrate-modules.ts` 自动生成。
// 它的职责是保留旧模块行为，后续应按优先级逐步去掉 `@ts-nocheck` 并收紧类型。

import { normalizeLegacyModuleError, normalizeLegacyModuleResponse } from './_migration.ts'
// 获取动态列表

import { createOption } from '../core/options.ts'
const legacyModule = (query, request) => {
  const data = {
    pagesize: query.pagesize || 20,
    lasttime: query.lasttime || -1,
  }
  return request(`/api/v1/event/get`, data, createOption(query, 'weapi'))
}

export default async function migratedEvent(query, request) {
  try {
    return normalizeLegacyModuleResponse(await legacyModule(query, request))
  } catch (error) {
    throw normalizeLegacyModuleError(error)
  }
}
