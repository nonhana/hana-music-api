// @ts-nocheck
// 此文件由 `scripts/migrate-modules.ts` 自动生成。
// 它的职责是保留旧模块行为，后续应按优先级逐步去掉 `@ts-nocheck` 并收紧类型。

import { normalizeLegacyModuleError, normalizeLegacyModuleResponse } from './_migration.ts'
//声音搜索
import { createOption } from '../core/options.ts'
const legacyModule = (query, request) => {
  const data = {
    limit: query.limit || '200',
    offset: query.offset || '0',
    name: query.name || null,
    displayStatus: query.displayStatus || null,
    type: query.type || null,
    voiceFeeType: query.voiceFeeType || null,
    radioId: query.voiceListId,
  }
  return request('/api/voice/workbench/voice/list', data, createOption(query))
}

export default async function migratedVoicelistListSearch(query, request) {
  try {
    return normalizeLegacyModuleResponse(await legacyModule(query, request))
  } catch (error) {
    throw normalizeLegacyModuleError(error)
  }
}
