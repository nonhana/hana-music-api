import type { ModuleRequest, NcmApiResponse } from '../types/index.ts'
import type { LegacyModuleQuery } from '../types/modules.ts'
import { normalizeLegacyModuleError, normalizeLegacyModuleResponse } from './_migration.ts'
import uploadPlugin from '../plugins/upload.ts'
import { createOption } from '../core/options.ts'
const legacyModule = async (query: LegacyModuleQuery, request: ModuleRequest) => {
  if (!query.imgFile) {
    return {
      status: 400,
      body: {
        code: 400,
        msg: 'imgFile is required',
      },
    }
  }
  const uploadInfo = await uploadPlugin(query, request)
  const res = await request(
    `/api/playlist/cover/update`,
    {
      id: query.id,
      coverImgId: uploadInfo.imgId,
    },
    createOption(query, 'weapi'),
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

export default async function migratedPlaylistCoverUpdate(query: LegacyModuleQuery, request: ModuleRequest): Promise<NcmApiResponse> {
  try {
    return normalizeLegacyModuleResponse(await legacyModule(query, request))
  } catch (error) {
    throw normalizeLegacyModuleError(error)
  }
}
