import type { ModuleRequest, NcmApiResponse } from '../types/index.ts'
import type { CheckMusicQuery } from '../types/modules.ts'

import { createOption } from '../core/options.ts'
// 歌曲可用性
import { normalizeLegacyModuleError, normalizeLegacyModuleResponse } from './_migration.ts'

interface CheckMusicItem {
  code?: number
}

interface CheckMusicResponseBody {
  code?: number
  data?: CheckMusicItem[]
  message?: string
  success?: boolean
}

const legacyModule = (query: CheckMusicQuery, request: ModuleRequest) => {
  const data = {
    ids: '[' + parseInt(String(query.id ?? 0), 10) + ']',
    br: parseInt(String(query.br ?? 999000), 10),
  }
  return request<CheckMusicResponseBody>(
    `/api/song/enhance/player/url`,
    data,
    createOption(query, 'weapi'),
  ).then((response) => {
    let playable = false
    if (response.body.code === 200) {
      if (response.body.data?.[0]?.code === 200) {
        playable = true
      }
    }
    if (playable) {
      response.body = { code: 200, success: true, message: 'ok' }
      return response
    } else {
      response.body = { code: 200, success: false, message: '亲爱的,暂无版权' }
      return response
    }
  })
}

export default async function migratedCheckMusic(
  query: CheckMusicQuery,
  request: ModuleRequest,
): Promise<NcmApiResponse> {
  try {
    return normalizeLegacyModuleResponse(await legacyModule(query, request))
  } catch (error) {
    throw normalizeLegacyModuleError(error)
  }
}
