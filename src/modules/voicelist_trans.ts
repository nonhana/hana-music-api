// @ts-nocheck
// 此文件由 `scripts/migrate-modules.ts` 自动生成。
// 它的职责是保留旧模块行为，后续应按优先级逐步去掉 `@ts-nocheck` 并收紧类型。

import { normalizeLegacyModuleError, normalizeLegacyModuleResponse } from './_migration.ts'
import { createOption } from '../core/options.ts'
const legacyModule = (query, request) => {
  const data = {
    limit: query.limit || '200', // 每页数量
    offset: query.offset || '0', // 偏移量
    radioId: query.radioId || null, // 电台id
    programId: query.programId || '0', // 节目id
    position: query.position || '1', // 排序编号
  }
  return request(
    `/api/voice/workbench/radio/program/trans`,
    data,
    createOption(query),
  )
}

export default async function migratedVoicelistTrans(query, request) {
  try {
    return normalizeLegacyModuleResponse(await legacyModule(query, request))
  } catch (error) {
    throw normalizeLegacyModuleError(error)
  }
}
