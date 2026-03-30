import type { ModuleRequest, NcmApiResponse } from '../types/index.ts'
import type { LegacyModuleQuery } from '../types/modules.ts'

import { normalizeLegacyModuleError, normalizeLegacyModuleResponse } from './_migration.ts'
// 相关歌单
const legacyModule = async (query: LegacyModuleQuery) => {
  const response = await fetch(`https://music.163.com/playlist?id=${query.id}`)
  const html = await response.text()
  try {
    const pattern =
      /<div class="cver u-cover u-cover-3">[\s\S]*?<img src="([^"]+)">[\s\S]*?<a class="sname f-fs1 s-fc0" href="([^"]+)"[^>]*>([^<]+?)<\/a>[\s\S]*?<a class="nm nm f-thide s-fc3" href="([^"]+)"[^>]*>([^<]+?)<\/a>/g
    let result: RegExpExecArray | null
    const playlists: Array<{
      coverImgUrl: string
      creator: { nickname: string; userId: string }
      id: string
      name: string
    }> = []
    while ((result = pattern.exec(html)) != null) {
      const [
        ,
        coverImgUrl = '',
        playlistHref = '',
        playlistName = '',
        userHref = '',
        nickname = '',
      ] = result
      playlists.push({
        creator: {
          userId: userHref.slice('/user/home?id='.length),
          nickname,
        },
        coverImgUrl: coverImgUrl.replace(/\?param=50y50$/u, ''),
        name: playlistName,
        id: playlistHref.slice('/playlist?id='.length),
      })
    }
    return {
      status: 200,
      body: { code: 200, playlists },
      cookie: [],
    }
  } catch (err) {
    throw {
      status: 500,
      body: { code: 500, msg: err instanceof Error ? err.stack || err.message : String(err) },
      cookie: [],
    }
  }
}

export default async function migratedRelatedPlaylist(
  query: LegacyModuleQuery,
  _request: ModuleRequest,
): Promise<NcmApiResponse> {
  try {
    return normalizeLegacyModuleResponse(await legacyModule(query))
  } catch (error) {
    throw normalizeLegacyModuleError(error)
  }
}
