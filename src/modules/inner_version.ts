import type { ModuleRequest, NcmApiResponse } from '../types/index.ts'
import type { LegacyModuleQuery } from '../types/modules.ts'

import { SERVICE_VERSION } from '../core/service-metadata.ts'
import { normalizeLegacyModuleError, normalizeLegacyModuleResponse } from './_migration.ts'

const legacyModule = (_query: LegacyModuleQuery, _request: ModuleRequest) => {
  return Promise.resolve({
    code: 200,
    status: 200,
    body: {
      code: 200,
      data: {
        version: SERVICE_VERSION,
      },
    },
  })
}

export default async function migratedInnerVersion(
  query: LegacyModuleQuery,
  request: ModuleRequest,
): Promise<NcmApiResponse> {
  try {
    return normalizeLegacyModuleResponse(await legacyModule(query, request))
  } catch (error) {
    throw normalizeLegacyModuleError(error)
  }
}
