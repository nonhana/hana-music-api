// @ts-nocheck
// 此文件由 `scripts/migrate-modules.ts` 自动生成。
// 它的职责是保留旧模块行为，后续应按优先级逐步去掉 `@ts-nocheck` 并收紧类型。

import { normalizeLegacyModuleError, normalizeLegacyModuleResponse } from './_migration.ts'
// 搜索建议

import { createOption } from '../core/options.ts'
const legacyModule = (query, request) => {
  const data = {
    s: query.keywords || '',
  }
  let type = query.type == 'mobile' ? 'keyword' : 'web'
  return request(
    `/api/search/suggest/` + type,
    data,
    createOption(query, 'weapi'),
  )
}

export default async function migratedSearchSuggest(query, request) {
  try {
    return normalizeLegacyModuleResponse(await legacyModule(query, request))
  } catch (error) {
    throw normalizeLegacyModuleError(error)
  }
}
