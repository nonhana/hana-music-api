import type { ModuleRequest, NcmApiResponse } from '../types/index.ts'
import type { LegacyModuleQuery } from '../types/modules.ts'

// 点赞与取消点赞资源
import { createOption } from '../core/options.ts'
import { normalizeLegacyModuleError, normalizeLegacyModuleResponse } from './_migration.ts'
import { resolveResourceType } from './_module-inputs.ts'
const legacyModule = (query: LegacyModuleQuery, request: ModuleRequest) => {
  query.t = Number(query.t) === 1 ? 'like' : 'unlike'
  query.type = resolveResourceType(query.type)
  const data: Record<string, unknown> = {
    threadId: `${String(query.type ?? '')}${String(query.id ?? '')}`,
  }
  if (query.type === 'A_EV_2_') {
    data.threadId = query.threadId
  }
  return request(`/api/resource/${query.t}`, data, createOption(query, 'weapi'))
}

export default async function migratedResourceLike(
  query: LegacyModuleQuery,
  request: ModuleRequest,
): Promise<NcmApiResponse> {
  try {
    return normalizeLegacyModuleResponse(await legacyModule(query, request))
  } catch (error) {
    throw normalizeLegacyModuleError(error)
  }
}
