import type { ModuleRequest, NcmApiResponse } from '../types/index.ts'
import type { LegacyModuleQuery } from '../types/modules.ts'

import { normalizeLegacyModuleError, normalizeLegacyModuleResponse } from './_migration.ts'
const pkg = { version: '0.0.0' }
const legacyModule = (_query: LegacyModuleQuery, _request: ModuleRequest) => {
  return Promise.resolve({
    code: 200,
    status: 200,
    body: {
      code: 200,
      data: {
        version: pkg.version,
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
