// @ts-nocheck
// 此文件由 `scripts/migrate-modules.ts` 自动生成。
// 它的职责是保留旧模块行为，后续应按优先级逐步去掉 `@ts-nocheck` 并收紧类型。

import { normalizeLegacyModuleError, normalizeLegacyModuleResponse } from './_migration.ts'
// 网易出品

import { createOption } from '../core/options.ts'
const legacyModule = (query, request) => {
  const data = {
    offset: query.offset || 0,
    limit: query.limit || 30,
  }
  return request(`/api/mv/exclusive/rcmd`, data, createOption(query))
}

export default async function migratedMvExclusiveRcmd(query, request) {
  try {
    return normalizeLegacyModuleResponse(await legacyModule(query, request))
  } catch (error) {
    throw normalizeLegacyModuleError(error)
  }
}
