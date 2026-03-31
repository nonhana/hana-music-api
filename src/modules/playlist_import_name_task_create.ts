import type { ModuleRequest, NcmApiResponse } from '../types/index.ts'
import type { LegacyModuleQuery } from '../types/modules.ts'

// 歌单导入 - 元数据/文字/链接导入
import { createOption } from '../core/options.ts'
import { normalizeLegacyModuleError, normalizeLegacyModuleResponse } from './_migration.ts'

interface PlaylistImportLocalEntry {
  album?: string
  artist?: string
  name?: string
}

const legacyModule = (query: LegacyModuleQuery, request: ModuleRequest) => {
  let data: Record<string, unknown> = {
    importStarPlaylist: query.importStarPlaylist || false, // 导入我喜欢的音乐
  }

  if (query.local) {
    // 元数据导入
    const local = readPlaylistImportLocalEntries(query.local)
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
      const link = readPlaylistImportLinks(query.link)
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

function readPlaylistImportLocalEntries(value: unknown): PlaylistImportLocalEntry[] {
  const parsed = readJsonArray(value)

  return parsed
    .filter((entry): entry is Record<string, unknown> => isRecordLike(entry))
    .map((entry) => {
      return {
        album: typeof entry.album === 'string' ? entry.album : undefined,
        artist: typeof entry.artist === 'string' ? entry.artist : undefined,
        name: typeof entry.name === 'string' ? entry.name : undefined,
      }
    })
}

function readPlaylistImportLinks(value: unknown): string[] {
  return readJsonArray(value)
    .filter((entry): entry is string => typeof entry === 'string')
    .map((entry) => entry)
}

function readJsonArray(value: unknown): unknown[] {
  try {
    const parsed = JSON.parse(String(value))
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function isRecordLike(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}
