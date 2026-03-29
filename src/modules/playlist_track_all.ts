// @ts-nocheck
// 此文件由 `scripts/migrate-modules.ts` 自动生成。
// 它的职责是保留旧模块行为，后续应按优先级逐步去掉 `@ts-nocheck` 并收紧类型。

import { normalizeLegacyModuleError, normalizeLegacyModuleResponse } from './_migration.ts'
// 通过传过来的歌单id拿到所有歌曲数据
// 支持传递参数limit来限制获取歌曲的数据数量 例如: /playlist/track/all?id=7044354223&limit=10

import { createOption } from '../core/options.ts'
const legacyModule = (query, request) => {
  const data = {
    id: query.id,
    n: 100000,
    s: query.s || 8,
  }
  //不放在data里面避免请求带上无用的数据
  let limit = parseInt(query.limit) || 1000
  let offset = parseInt(query.offset) || 0

  return request(`/api/v6/playlist/detail`, data, createOption(query)).then(
    (res) => {
      let trackIds = res.body.playlist.trackIds
      let idsData = {
        c:
          '[' +
          trackIds
            .slice(offset, offset + limit)
            .map((item) => '{"id":' + item.id + '}')
            .join(',') +
          ']',
      }

      return request(`/api/v3/song/detail`, idsData, createOption(query))
    },
  )
}

export default async function migratedPlaylistTrackAll(query, request) {
  try {
    return normalizeLegacyModuleResponse(await legacyModule(query, request))
  } catch (error) {
    throw normalizeLegacyModuleError(error)
  }
}
