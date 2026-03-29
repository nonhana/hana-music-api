// @ts-nocheck
// 此文件由 `scripts/migrate-modules.ts` 自动生成。
// 它的职责是保留旧模块行为，后续应按优先级逐步去掉 `@ts-nocheck` 并收紧类型。

import { normalizeLegacyModuleError, normalizeLegacyModuleResponse } from './_migration.ts'
// 数字专辑&数字单曲-榜单
import { createOption } from '../core/options.ts'
const legacyModule = (query, request) => {
  let data = {
    albumType: query.albumType || 0, //0为数字专辑,1为数字单曲
  }
  const type = query.type || 'daily' // daily,week,year,total
  if (type === 'year') {
    data = {
      ...data,
      year: query.year,
    }
  }
  return request(
    `/api/feealbum/songsaleboard/${type}/type`,
    data,
    createOption(query, 'weapi'),
  )
}

export default async function migratedAlbumSongsaleboard(query, request) {
  try {
    return normalizeLegacyModuleResponse(await legacyModule(query, request))
  } catch (error) {
    throw normalizeLegacyModuleError(error)
  }
}
