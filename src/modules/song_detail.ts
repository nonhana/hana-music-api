// @ts-nocheck
// 此文件由 `scripts/migrate-modules.ts` 自动生成。
// 它的职责是保留旧模块行为，后续应按优先级逐步去掉 `@ts-nocheck` 并收紧类型。

import { normalizeLegacyModuleError, normalizeLegacyModuleResponse } from './_migration.ts'
// 歌曲详情

import { createOption } from '../core/options.ts'
const legacyModule = (query, request) => {
  // 歌曲数量不要超过1000
  query.ids = query.ids.split(/\s*,\s*/)
  const data = {
    c: '[' + query.ids.map((id) => '{"id":' + id + '}').join(',') + ']',
  }
  return request(`/api/v3/song/detail`, data, createOption(query, 'weapi'))
}

export default async function migratedSongDetail(query, request) {
  try {
    return normalizeLegacyModuleResponse(await legacyModule(query, request))
  } catch (error) {
    throw normalizeLegacyModuleError(error)
  }
}
