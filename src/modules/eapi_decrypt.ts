import type { ModuleRequest, NcmApiResponse } from '../types/index.ts'
import type { LegacyModuleQuery } from '../types/modules.ts'

import { eapiResDecrypt, eapiReqDecrypt } from '../core/crypto.ts'
import { normalizeLegacyModuleError, normalizeLegacyModuleResponse } from './_migration.ts'

const legacyModule = async (query: LegacyModuleQuery, _request: ModuleRequest) => {
  const hexString = query.hexString.replace(/\s/g, '')
  const isReq = query.isReq !== 'false'

  if (!hexString) {
    return {
      status: 400,
      body: {
        code: 400,
        message: 'hex string is required',
      },
    }
  }

  let data
  if (isReq) {
    data = eapiReqDecrypt(hexString)
  } else {
    data = eapiResDecrypt(hexString) || eapiResDecrypt(hexString, true)
  }

  return {
    status: 200,
    body: {
      code: 200,
      data: data,
    },
  }
}

export default async function migratedEapiDecrypt(
  query: LegacyModuleQuery,
  request: ModuleRequest,
): Promise<NcmApiResponse> {
  try {
    return normalizeLegacyModuleResponse(await legacyModule(query, request))
  } catch (error) {
    throw normalizeLegacyModuleError(error)
  }
}
