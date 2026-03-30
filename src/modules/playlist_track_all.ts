import type { ModuleRequest, NcmApiResponse } from '../types/index.ts'
import type { PlaylistTrackAllQuery } from '../types/modules.ts'

import { createOption } from '../core/options.ts'
// 通过传过来的歌单id拿到所有歌曲数据
// 支持传递参数limit来限制获取歌曲的数据数量 例如: /playlist/track/all?id=7044354223&limit=10
import { normalizeLegacyModuleError, normalizeLegacyModuleResponse } from './_migration.ts'
const legacyModule = (query: PlaylistTrackAllQuery, request: ModuleRequest) => {
  const data = {
    id: query.id,
    n: 100000,
    s: query.s || 8,
  }
  //不放在data里面避免请求带上无用的数据
  const limit = parseInt(String(query.limit ?? 1000), 10) || 1000
  const offset = parseInt(String(query.offset ?? 0), 10) || 0

  return request(`/api/v6/playlist/detail`, data, createOption(query)).then((res) => {
    const trackIds = (res.body.playlist?.trackIds as Array<{ id: number | string }>) ?? []
    const idsData = {
      c:
        '[' +
        trackIds
          .slice(offset, offset + limit)
          .map((item: { id: number | string }) => '{"id":' + item.id + '}')
          .join(',') +
        ']',
    }

    return request(`/api/v3/song/detail`, idsData, createOption(query))
  })
}

export default async function migratedPlaylistTrackAll(
  query: PlaylistTrackAllQuery,
  request: ModuleRequest,
): Promise<NcmApiResponse> {
  try {
    return normalizeLegacyModuleResponse(await legacyModule(query, request))
  } catch (error) {
    throw normalizeLegacyModuleError(error)
  }
}
