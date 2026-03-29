// @ts-nocheck
// 此文件由 `scripts/migrate-modules.ts` 自动生成。
// 它的职责是保留旧模块行为，后续应按优先级逐步去掉 `@ts-nocheck` 并收紧类型。

import { normalizeLegacyModuleError, normalizeLegacyModuleResponse } from './_migration.ts'
// 歌手相关视频

import { createOption } from '../core/options.ts'
const legacyModule = (query, request) => {
  const data = {
    artistId: query.id,
    page: JSON.stringify({
      size: query.size || 10,
      cursor: query.cursor || 0,
    }),
    tab: 0,
    order: query.order || 0,
  }
  return request(`/api/mlog/artist/video`, data, createOption(query, 'weapi'))
}

export default async function migratedArtistVideo(query, request) {
  try {
    return normalizeLegacyModuleResponse(await legacyModule(query, request))
  } catch (error) {
    throw normalizeLegacyModuleError(error)
  }
}
