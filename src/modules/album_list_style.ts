import type { ModuleRequest, NcmApiResponse } from '../types/index.ts'
import type { LegacyModuleQuery } from '../types/modules.ts'
import { normalizeLegacyModuleError, normalizeLegacyModuleResponse } from './_migration.ts'
// 数字专辑-语种风格馆
import { createOption } from '../core/options.ts'
const legacyModule = (query: LegacyModuleQuery, request: ModuleRequest) => {
  const data = {
    limit: query.limit || 10,
    offset: query.offset || 0,
    total: true,
    area: query.area || 'Z_H', //Z_H:华语,E_A:欧美,KR:韩国,JP:日本
  }
  return request(
    `/api/vipmall/appalbum/album/style`,
    data,
    createOption(query, 'weapi'),
  )
}

export default async function migratedAlbumListStyle(query: LegacyModuleQuery, request: ModuleRequest): Promise<NcmApiResponse> {
  try {
    return normalizeLegacyModuleResponse(await legacyModule(query, request))
  } catch (error) {
    throw normalizeLegacyModuleError(error)
  }
}
