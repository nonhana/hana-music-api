import type { ModuleRequest, NcmApiResponse } from '../types/index.ts'
import type { LegacyModuleQuery } from '../types/modules.ts'

// 歌单导入 - 元数据/文字/链接导入
import { createOption } from '../core/options.ts'
import { normalizeLegacyModuleError, normalizeLegacyModuleResponse } from './_migration.ts'
const legacyModule = (query: LegacyModuleQuery, request: ModuleRequest) => {
  let data: Record<string, unknown> = {
    importStarPlaylist: query.importStarPlaylist || false, // 导入我喜欢的音乐
  }

  if (query.local) {
    // 元数据导入
    const local = JSON.parse(String(query.local)) as Array<{
      album?: string
      artist?: string
      name?: string
    }>
    const multiSongs = JSON.stringify(
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
    const playlistName = query.playlistName || '导入音乐 '.concat(new Date().toLocaleString()) // 歌单名称
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
      const link = JSON.parse(String(query.link)) as string[]
      songs = JSON.stringify(
        link.map(function (e: string) {
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
  return request(`/api/playlist/import/name/task/create`, data, createOption(query))
}

export default async function migratedPlaylistImportNameTaskCreate(
  query: LegacyModuleQuery,
  request: ModuleRequest,
): Promise<NcmApiResponse> {
  try {
    return normalizeLegacyModuleResponse(await legacyModule(query, request))
  } catch (error) {
    throw normalizeLegacyModuleError(error)
  }
}
