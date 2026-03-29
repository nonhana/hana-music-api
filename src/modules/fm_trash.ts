// @ts-nocheck
// 此文件由 `scripts/migrate-modules.ts` 自动生成。
// 它的职责是保留旧模块行为，后续应按优先级逐步去掉 `@ts-nocheck` 并收紧类型。

import { normalizeLegacyModuleError, normalizeLegacyModuleResponse } from './_migration.ts'
// 垃圾桶

import { createOption } from '../core/options.ts'
const legacyModule = (query, request) => {
  const data = {
    songId: query.id,
    alg: 'RT',
    time: query.time || 25,
  }
  return request(`/api/radio/trash/add`, data, createOption(query, 'weapi'))
}

export default async function migratedFmTrash(query, request) {
  try {
    return normalizeLegacyModuleResponse(await legacyModule(query, request))
  } catch (error) {
    throw normalizeLegacyModuleError(error)
  }
}
