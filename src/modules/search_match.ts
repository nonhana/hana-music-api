// @ts-nocheck
// 此文件由 `scripts/migrate-modules.ts` 自动生成。
// 它的职责是保留旧模块行为，后续应按优先级逐步去掉 `@ts-nocheck` 并收紧类型。

import { normalizeLegacyModuleError, normalizeLegacyModuleResponse } from './_migration.ts'
// 本地歌曲匹配音乐信息

import { createOption } from '../core/options.ts'
const legacyModule = (query, request) => {
  let songs = [
    {
      title: query.title || '',
      album: query.album || '',
      artist: query.artist || '',
      duration: query.duration || 0,
      persistId: query.md5,
    },
  ]
  const data = {
    songs: JSON.stringify(songs),
  }
  return request(`/api/search/match/new`, data, createOption(query))
}

export default async function migratedSearchMatch(query, request) {
  try {
    return normalizeLegacyModuleResponse(await legacyModule(query, request))
  } catch (error) {
    throw normalizeLegacyModuleError(error)
  }
}
