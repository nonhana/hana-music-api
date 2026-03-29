// @ts-nocheck
// 此文件由 `scripts/migrate-modules.ts` 自动生成。
// 它的职责是保留旧模块行为，后续应按优先级逐步去掉 `@ts-nocheck` 并收紧类型。

import { normalizeLegacyModuleError, normalizeLegacyModuleResponse } from './_migration.ts'
// 歌曲链接
import { createOption } from '../core/options.ts'
const legacyModule = async (query, request) => {
  const ids = String(query.id).split(',')
  const data = {
    ids: JSON.stringify(ids),
    br: parseInt(query.br || 999000),
  }
  const res = await request(
    `/api/song/enhance/player/url`,
    data,
    createOption(query),
  )
  // 根据id排序
  const result = res.body.data
  result.sort((a, b) => {
    return ids.indexOf(String(a.id)) - ids.indexOf(String(b.id))
  })
  return {
    status: 200,
    body: {
      code: 200,
      data: result,
    },
  }
}

export default async function migratedSongUrl(query, request) {
  try {
    return normalizeLegacyModuleResponse(await legacyModule(query, request))
  } catch (error) {
    throw normalizeLegacyModuleError(error)
  }
}
