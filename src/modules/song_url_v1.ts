import type { ModuleRequest, NcmApiResponse } from '../types/index.ts'
import type { SongUrlV1Query } from '../types/modules.ts'

import { createOption } from '../core/options.ts'
// 歌曲链接 - v1
// 此版本不再采用 br 作为音质区分的标准
// 而是采用 standard, exhigh, lossless, hires, jyeffect(高清环绕声), sky(沉浸环绕声), jymaster(超清母带) 进行音质判断
import { normalizeLegacyModuleError, normalizeLegacyModuleResponse } from './_migration.ts'
const legacyModule = (query: SongUrlV1Query, request: ModuleRequest) => {
  const data: Record<string, unknown> = {
    ids: '[' + query.id + ']',
    level: query.level,
    encodeType: 'flac',
  }
  if (data.level === 'sky') {
    data.immerseType = 'c51'
  }
  return request(`/api/song/enhance/player/url/v1`, data, createOption(query))
}

export default async function migratedSongUrlV1(
  query: SongUrlV1Query,
  request: ModuleRequest,
): Promise<NcmApiResponse> {
  try {
    return normalizeLegacyModuleResponse(await legacyModule(query, request))
  } catch (error) {
    throw normalizeLegacyModuleError(error)
  }
}
