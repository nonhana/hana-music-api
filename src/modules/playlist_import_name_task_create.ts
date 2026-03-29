// @ts-nocheck
// 此文件由 `scripts/migrate-modules.ts` 自动生成。
// 它的职责是保留旧模块行为，后续应按优先级逐步去掉 `@ts-nocheck` 并收紧类型。

import { normalizeLegacyModuleError, normalizeLegacyModuleResponse } from './_migration.ts'
// 歌单导入 - 元数据/文字/链接导入
import { createOption } from '../core/options.ts'
const legacyModule = (query, request) => {
  let data = {
    importStarPlaylist: query.importStarPlaylist || false, // 导入我喜欢的音乐
  }

  if (query.local) {
    // 元数据导入
    let local = JSON.parse(query.local)
    let multiSongs = JSON.stringify(
      local.map(function (e) {
        return {
          songName: e.name,
          artistName: e.artist,
          albumName: e.album,
        }
      }),
    )
    data = {
      ...data,
      multiSongs: multiSongs,
    }
  } else {
    let playlistName = // 歌单名称
      query.playlistName || '导入音乐 '.concat(new Date().toLocaleString())
    let songs = ''
    if (query.text) {
      // 文字导入
      songs = JSON.stringify([
        {
          name: playlistName,
          type: '',
          url: encodeURI('rpc://playlist/import?text='.concat(query.text)),
        },
      ])
    }

    if (query.link) {
      // 链接导入
      let link = JSON.parse(query.link)
      songs = JSON.stringify(
        link.map(function (e) {
          return { name: playlistName, type: '', url: encodeURI(e) }
        }),
      )
    }
    data = {
      ...data,
      playlistName: playlistName,
      createBusinessCode: undefined,
      extParam: undefined,
      taskIdForLog: '',
      songs: songs,
    }
  }
  return request(
    `/api/playlist/import/name/task/create`,
    data,
    createOption(query),
  )
}

export default async function migratedPlaylistImportNameTaskCreate(query, request) {
  try {
    return normalizeLegacyModuleResponse(await legacyModule(query, request))
  } catch (error) {
    throw normalizeLegacyModuleError(error)
  }
}
