// @ts-nocheck
// 此文件由 `scripts/migrate-modules.ts` 自动生成。
// 它的职责是保留旧模块行为，后续应按优先级逐步去掉 `@ts-nocheck` 并收紧类型。

import { normalizeLegacyModuleError, normalizeLegacyModuleResponse } from './_migration.ts'
import { createOption } from '../core/options.ts'
const legacyModule = async (query, request) => {
  query.ids = query.ids || ''
  const data = {
    id: query.pid,
    tracks: JSON.stringify(
      query.ids.split(',').map((item) => {
        return { type: 3, id: item }
      }),
    ),
  }
  console.log(data)

  return request(`/api/playlist/track/add`, data, createOption(query, 'weapi'))
}

export default async function migratedPlaylistTrackAdd(query, request) {
  try {
    return normalizeLegacyModuleResponse(await legacyModule(query, request))
  } catch (error) {
    throw normalizeLegacyModuleError(error)
  }
}
