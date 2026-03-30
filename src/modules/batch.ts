import type { ModuleRequest, NcmApiResponse } from '../types/index.ts'
import type { BatchQuery } from '../types/modules.ts'

import { createOption } from '../core/options.ts'
// 批量请求接口
import { normalizeLegacyModuleError, normalizeLegacyModuleResponse } from './_migration.ts'
const legacyModule = (query: BatchQuery, request: ModuleRequest) => {
  const data: Record<string, unknown> = {}
  Object.keys(query).forEach((i) => {
    if (i.startsWith('/api/')) {
      data[i] = query[i]
    }
  })
  return request(`/api/batch`, data, createOption(query))
}

export default async function migratedBatch(
  query: BatchQuery,
  request: ModuleRequest,
): Promise<NcmApiResponse> {
  try {
    return normalizeLegacyModuleResponse(await legacyModule(query, request))
  } catch (error) {
    throw normalizeLegacyModuleError(error)
  }
}
