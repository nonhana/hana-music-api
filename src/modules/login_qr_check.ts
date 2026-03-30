import type { ModuleRequest, NcmApiResponse } from '../types/index.ts'
import type { LoginQrCheckQuery } from '../types/modules.ts'

import { createOption } from '../core/options.ts'
import { normalizeLegacyModuleError, normalizeLegacyModuleResponse } from './_migration.ts'
const legacyModule = async (query: LoginQrCheckQuery, request: ModuleRequest) => {
  const data = {
    key: query.key,
    type: 3,
  }
  let result
  try {
    result = await request(`/api/login/qrcode/client/login`, data, createOption(query))
    result = {
      status: 200,
      body: {
        ...result.body,
        cookie: result.cookie.join(';'),
      },
      cookie: result.cookie,
    }
    return result
  } catch {
    return {
      status: 200,
      body: {},
      cookie: result?.cookie ?? [],
    }
  }
}

export default async function migratedLoginQrCheck(
  query: LoginQrCheckQuery,
  request: ModuleRequest,
): Promise<NcmApiResponse> {
  try {
    return normalizeLegacyModuleResponse(await legacyModule(query, request))
  } catch (error) {
    throw normalizeLegacyModuleError(error)
  }
}
