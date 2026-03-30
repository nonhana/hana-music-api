import type { ModuleRequest, NcmApiResponse } from '../types/index.ts'
import type { LegacyModuleQuery } from '../types/modules.ts'

import { createOption } from '../core/options.ts'
import { normalizeLegacyModuleError, normalizeLegacyModuleResponse } from './_migration.ts'
const legacyModule = async (query: LegacyModuleQuery, request: ModuleRequest) => {
  const ids = String(query.ids ?? '')
  const data = {
    id: query.pid,
    tracks: JSON.stringify(
      ids.split(',').map((item: string) => {
        return { type: 3, id: item }
      }),
    ),
  }

  return request(`/api/playlist/track/add`, data, createOption(query, 'weapi'))
}

export default async function migratedPlaylistTrackAdd(
  query: LegacyModuleQuery,
  request: ModuleRequest,
): Promise<NcmApiResponse> {
  try {
    return normalizeLegacyModuleResponse(await legacyModule(query, request))
  } catch (error) {
    throw normalizeLegacyModuleError(error)
  }
}
