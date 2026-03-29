// @ts-nocheck
// 此文件由 `scripts/migrate-modules.ts` 自动生成。
// 它的职责是保留旧模块行为，后续应按优先级逐步去掉 `@ts-nocheck` 并收紧类型。

import { normalizeLegacyModuleError, normalizeLegacyModuleResponse } from './_migration.ts'
// 全部MV

import { createOption } from '../core/options.ts'
const legacyModule = (query, request) => {
  const data = {
    tags: JSON.stringify({
      地区: query.area || '全部',
      类型: query.type || '全部',
      排序: query.order || '上升最快',
    }),
    offset: query.offset || 0,
    total: 'true',
    limit: query.limit || 30,
  }
  return request(`/api/mv/all`, data, createOption(query))
}

export default async function migratedMvAll(query, request) {
  try {
    return normalizeLegacyModuleResponse(await legacyModule(query, request))
  } catch (error) {
    throw normalizeLegacyModuleError(error)
  }
}
