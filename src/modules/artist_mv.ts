// @ts-nocheck
// 此文件由 `scripts/migrate-modules.ts` 自动生成。
// 它的职责是保留旧模块行为，后续应按优先级逐步去掉 `@ts-nocheck` 并收紧类型。

import { normalizeLegacyModuleError, normalizeLegacyModuleResponse } from './_migration.ts'
// 歌手相关MV

import { createOption } from '../core/options.ts'
const legacyModule = (query, request) => {
  const data = {
    artistId: query.id,
    limit: query.limit,
    offset: query.offset,
    total: true,
  }
  return request(`/api/artist/mvs`, data, createOption(query, 'weapi'))
}

export default async function migratedArtistMv(query, request) {
  try {
    return normalizeLegacyModuleResponse(await legacyModule(query, request))
  } catch (error) {
    throw normalizeLegacyModuleError(error)
  }
}
