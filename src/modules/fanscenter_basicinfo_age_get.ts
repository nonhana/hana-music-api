// @ts-nocheck
// 此文件由 `scripts/migrate-modules.ts` 自动生成。
// 它的职责是保留旧模块行为，后续应按优先级逐步去掉 `@ts-nocheck` 并收紧类型。

import { normalizeLegacyModuleError, normalizeLegacyModuleResponse } from './_migration.ts'
// 粉丝年龄比例
import { createOption } from '../core/options.ts'
const legacyModule = (query, request) => {
  const data = {}
  return request(`/api/fanscenter/basicinfo/age/get`, data, createOption(query))
}

export default async function migratedFanscenterBasicinfoAgeGet(query, request) {
  try {
    return normalizeLegacyModuleResponse(await legacyModule(query, request))
  } catch (error) {
    throw normalizeLegacyModuleError(error)
  }
}
