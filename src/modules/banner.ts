import type { ModuleRequest, NcmApiResponse } from '../types/index.ts'
import type { LegacyModuleQuery } from '../types/modules.ts'

// 首页轮播图
import { createOption } from '../core/options.ts'
import { normalizeLegacyModuleError, normalizeLegacyModuleResponse } from './_migration.ts'
const legacyModule = (query: LegacyModuleQuery, request: ModuleRequest) => {
  const clientTypeMap: Record<string, string> = {
    0: 'pc',
    1: 'android',
    2: 'iphone',
    3: 'ipad',
  }
  const type = clientTypeMap[String(query.type ?? 0)] || 'pc'
  return request(`/api/v2/banner/get`, { clientType: type }, createOption(query))
}

export default async function migratedBanner(
  query: LegacyModuleQuery,
  request: ModuleRequest,
): Promise<NcmApiResponse> {
  try {
    return normalizeLegacyModuleResponse(await legacyModule(query, request))
  } catch (error) {
    throw normalizeLegacyModuleError(error)
  }
}
