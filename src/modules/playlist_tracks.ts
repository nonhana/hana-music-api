import type { ModuleRequest, NcmApiResponse } from '../types/index.ts'
import type { LegacyModuleQuery } from '../types/modules.ts'

import { createOption } from '../core/options.ts'
// 收藏单曲到歌单 从歌单删除歌曲
import { normalizeLegacyModuleError, normalizeLegacyModuleResponse } from './_migration.ts'
const legacyModule = async (query: LegacyModuleQuery, request: ModuleRequest) => {
  //
  const tracks = String(query.tracks ?? '').split(',')
  const data = {
    op: query.op, // del,add
    pid: query.pid, // 歌单id
    trackIds: JSON.stringify(tracks), // 歌曲id
    imme: 'true',
  }

  try {
    const res = await request(`/api/playlist/manipulate/tracks`, data, createOption(query))
    return {
      status: 200,
      body: {
        ...res,
      },
    }
  } catch (error) {
    if (
      typeof error === 'object' &&
      error !== null &&
      'body' in error &&
      typeof error.body === 'object' &&
      error.body !== null &&
      'code' in error.body &&
      error.body.code === 512
    ) {
      return request(
        `/api/playlist/manipulate/tracks`,
        {
          op: query.op, // del,add
          pid: query.pid, // 歌单id
          trackIds: JSON.stringify([...tracks, ...tracks]),
          imme: 'true',
        },
        createOption(query),
      )
    } else {
      return {
        status: 200,
        body:
          typeof error === 'object' && error !== null && 'body' in error
            ? (error.body as Record<string, unknown>)
            : { code: 500, msg: String(error) },
      }
    }
  }
}

export default async function migratedPlaylistTracks(
  query: LegacyModuleQuery,
  request: ModuleRequest,
): Promise<NcmApiResponse> {
  try {
    return normalizeLegacyModuleResponse(await legacyModule(query, request))
  } catch (error) {
    throw normalizeLegacyModuleError(error)
  }
}
