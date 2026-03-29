// @ts-nocheck
// 此文件由 `scripts/migrate-modules.ts` 自动生成。
// 它的职责是保留旧模块行为，后续应按优先级逐步去掉 `@ts-nocheck` 并收紧类型。

import { normalizeLegacyModuleError, normalizeLegacyModuleResponse } from './_migration.ts'
// 相关歌单
import axios from 'axios'
import { createOption } from '../core/options.ts'
const legacyModule = async (query, request) => {
  const res = await axios({
    method: 'GET',
    url: `https://music.163.com/playlist?id=${query.id}`,
  })
  try {
    const pattern =
      /<div class="cver u-cover u-cover-3">[\s\S]*?<img src="([^"]+)">[\s\S]*?<a class="sname f-fs1 s-fc0" href="([^"]+)"[^>]*>([^<]+?)<\/a>[\s\S]*?<a class="nm nm f-thide s-fc3" href="([^"]+)"[^>]*>([^<]+?)<\/a>/g
    let result,
      playlists = []
    while ((result = pattern.exec(res.data)) != null) {
      playlists.push({
        creator: {
          userId: result[4].slice('/user/home?id='.length),
          nickname: result[5],
        },
        coverImgUrl: result[1].slice(0, -'?param=50y50'.length),
        name: result[3],
        id: result[2].slice('/playlist?id='.length),
      })
    }
    res.body = { code: 200, playlists: playlists }
    return res
  } catch (err) {
    res.status = 500
    res.body = { code: 500, msg: err.stack }
    return Promise.reject(res)
  }
}

export default async function migratedRelatedPlaylist(query, request) {
  try {
    return normalizeLegacyModuleResponse(await legacyModule(query, request))
  } catch (error) {
    throw normalizeLegacyModuleError(error)
  }
}
