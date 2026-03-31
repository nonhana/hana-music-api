import type { ModuleRequest, NcmApiResponse } from '../types/index.ts'
import type { SongUrlQuery } from '../types/modules.ts'

// 歌曲链接
import { createOption } from '../core/options.ts'
import { normalizeLegacyModuleError, normalizeLegacyModuleResponse } from './_migration.ts'

interface SongUrlItem {
  id: number | string
  url?: string
}

interface SongUrlBody {
  data?: SongUrlItem[]
}

const legacyModule = async (query: SongUrlQuery, request: ModuleRequest) => {
  const ids = String(query.id).split(',')
  const data = {
    ids: JSON.stringify(ids),
    br: parseInt(String(query.br ?? 999000), 10),
  }
  const res = await request<SongUrlBody>(`/api/song/enhance/player/url`, data, createOption(query))
  // 根据id排序
  const result = [...(res.body.data ?? [])]
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

export default async function migratedSongUrl(
  query: SongUrlQuery,
  request: ModuleRequest,
): Promise<NcmApiResponse> {
  try {
    return normalizeLegacyModuleResponse(await legacyModule(query, request))
  } catch (error) {
    throw normalizeLegacyModuleError(error)
  }
}
