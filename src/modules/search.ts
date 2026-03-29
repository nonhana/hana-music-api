// @ts-nocheck
// 此文件由 `scripts/migrate-modules.ts` 自动生成。
// 它的职责是保留旧模块行为，后续应按优先级逐步去掉 `@ts-nocheck` 并收紧类型。

import { normalizeLegacyModuleError, normalizeLegacyModuleResponse } from './_migration.ts'
// 搜索

import { createOption } from '../core/options.ts'
const legacyModule = (query, request) => {
  if (query.type && query.type == '2000') {
    const data = {
      keyword: query.keywords,
      scene: 'normal',
      limit: query.limit || 30,
      offset: query.offset || 0,
    }
    return request(`/api/search/voice/get`, data, createOption(query))
  }
  const data = {
    s: query.keywords,
    type: query.type || 1, // 1: 单曲, 10: 专辑, 100: 歌手, 1000: 歌单, 1002: 用户, 1004: MV, 1006: 歌词, 1009: 电台, 1014: 视频
    limit: query.limit || 30,
    offset: query.offset || 0,
  }
  return request(`/api/search/get`, data, createOption(query))
}

export default async function migratedSearch(query, request) {
  try {
    return normalizeLegacyModuleResponse(await legacyModule(query, request))
  } catch (error) {
    throw normalizeLegacyModuleError(error)
  }
}
