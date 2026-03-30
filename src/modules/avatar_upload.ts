import type { ModuleRequest, NcmApiResponse } from '../types/index.ts'
import type { LegacyModuleQuery } from '../types/modules.ts'

import { createOption } from '../core/options.ts'
import uploadPlugin from '../plugins/upload.ts'
import { normalizeLegacyModuleError, normalizeLegacyModuleResponse } from './_migration.ts'
const legacyModule = async (query: LegacyModuleQuery, request: ModuleRequest) => {
  const uploadInfo = await uploadPlugin(query, request)
  const res = await request(
    `/api/user/avatar/upload/v1`,
    {
      imgid: uploadInfo.imgId,
    },
    createOption(query),
  )
  return {
    status: 200,
    body: {
      code: 200,
      data: {
        ...uploadInfo,
        ...res.body,
      },
    },
  }
}

export default async function migratedAvatarUpload(
  query: LegacyModuleQuery,
  request: ModuleRequest,
): Promise<NcmApiResponse> {
  try {
    return normalizeLegacyModuleResponse(await legacyModule(query, request))
  } catch (error) {
    throw normalizeLegacyModuleError(error)
  }
}
