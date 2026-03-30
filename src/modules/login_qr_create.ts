import * as QRCode from 'qrcode'

import type { ModuleRequest, NcmApiResponse } from '../types/index.ts'
import type { LoginQrCreateQuery } from '../types/modules.ts'

import { generateChainId } from '../core/utils.ts'
import { normalizeLegacyModuleError, normalizeLegacyModuleResponse } from './_migration.ts'

const legacyModule = async (query: LoginQrCreateQuery) => {
  const platform = query.platform || 'pc'
  const cookie = query.cookie || ''

  let url = `https://music.163.com/login?codekey=${query.key}`

  if (platform === 'web') {
    const chainId = generateChainId(cookie)
    url += `&chainId=${chainId}`
  }

  return {
    status: 200,
    body: {
      code: 200,
      data: {
        qrurl: url,
        qrimg: query.qrimg ? await QRCode.toDataURL(url) : '',
      },
    },
    cookie: [],
  }
}

export default async function migratedLoginQrCreate(
  query: LoginQrCreateQuery,
  _request: ModuleRequest,
): Promise<NcmApiResponse> {
  try {
    return normalizeLegacyModuleResponse(await legacyModule(query))
  } catch (error) {
    throw normalizeLegacyModuleError(error)
  }
}
