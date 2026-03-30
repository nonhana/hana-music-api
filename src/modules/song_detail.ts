import type { ModuleRequest, NcmApiResponse } from '../types/index.ts'
import type { LegacyModuleQuery } from '../types/modules.ts'

import { createOption } from '../core/options.ts'
// 歌曲详情
import { normalizeLegacyModuleError, normalizeLegacyModuleResponse } from './_migration.ts'
const legacyModule = (query: LegacyModuleQuery, request: ModuleRequest) => {
  // 歌曲数量不要超过1000
  const ids = String(query.ids ?? '').split(/\s*,\s*/)
  const data = {
    c: '[' + ids.map((id: string) => '{"id":' + id + '}').join(',') + ']',
  }
  return request(`/api/v3/song/detail`, data, createOption(query, 'weapi'))
}

export default async function migratedSongDetail(
  query: LegacyModuleQuery,
  request: ModuleRequest,
): Promise<NcmApiResponse> {
  try {
    return normalizeLegacyModuleResponse(await legacyModule(query, request))
  } catch (error) {
    throw normalizeLegacyModuleError(error)
  }
}
