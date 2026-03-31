import type { ModuleRequest, NcmApiResponse } from '../types/index.ts'
import type { AlbumSubQuery } from '../types/modules.ts'

import { createOption } from '../core/options.ts'
// 收藏/取消收藏专辑
import { normalizeLegacyModuleError, normalizeLegacyModuleResponse } from './_migration.ts'
const legacyModule = (query: AlbumSubQuery, request: ModuleRequest) => {
  const action = Number(query.t) === 1 ? 'sub' : 'unsub'
  const data = {
    id: query.id,
  }
  return request(`/api/album/${action}`, data, createOption(query, 'weapi'))
}

export default async function migratedAlbumSub(
  query: AlbumSubQuery,
  request: ModuleRequest,
): Promise<NcmApiResponse> {
  try {
    return normalizeLegacyModuleResponse(await legacyModule(query, request))
  } catch (error) {
    throw normalizeLegacyModuleError(error)
  }
}
