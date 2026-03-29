// @ts-nocheck
// 此文件由 `scripts/migrate-modules.ts` 自动生成。
// 它的职责是保留旧模块行为，后续应按优先级逐步去掉 `@ts-nocheck` 并收紧类型。

import { normalizeLegacyModuleError, normalizeLegacyModuleResponse } from './_migration.ts'
// 收藏单曲到歌单 从歌单删除歌曲

import { createOption } from '../core/options.ts'
const legacyModule = async (query, request) => {
  query.ids = query.ids || ''
  const data = {
    id: query.id,
    tracks: JSON.stringify(
      query.ids.split(',').map((item) => {
        return { type: 3, id: item }
      }),
    ),
  }

  return request(
    `/api/playlist/track/delete`,
    data,
    createOption(query, 'weapi'),
  )
}

export default async function migratedPlaylistTrackDelete(query, request) {
  try {
    return normalizeLegacyModuleResponse(await legacyModule(query, request))
  } catch (error) {
    throw normalizeLegacyModuleError(error)
  }
}
