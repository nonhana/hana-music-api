import { createHash } from 'node:crypto'

import type { ModuleRequest, NcmApiResponse } from '../types/index.ts'
import type { RegisterAnonymousQuery } from '../types/modules.ts'

import { setRuntimeState } from '../core/runtime.ts'
import { normalizeLegacyModuleError, normalizeLegacyModuleResponse } from './_migration.ts'
const ID_XOR_KEY_1 = '3go8&$8*3*3h0k(2)2'

import { createOption } from '../core/options.ts'
import { generateDeviceId } from '../core/utils.ts'

// function getRandomFromList(list) {
//   return list[Math.floor(Math.random() * list.length)]
// }
function cloudmusic_dll_encode_id(some_id: string) {
  let xoredString = ''
  for (let i = 0; i < some_id.length; i++) {
    const charCode = some_id.charCodeAt(i) ^ ID_XOR_KEY_1.charCodeAt(i % ID_XOR_KEY_1.length)
    xoredString += String.fromCharCode(charCode)
  }
  return createHash('md5').update(xoredString, 'utf8').digest('base64')
}

const legacyModule = async (query: RegisterAnonymousQuery, request: ModuleRequest) => {
  const deviceId = generateDeviceId()
  setRuntimeState({ deviceId })
  const encodedId = Buffer.from(
    `${deviceId} ${cloudmusic_dll_encode_id(deviceId)}`,
    'utf8',
  ).toString('base64')
  const data = {
    username: encodedId,
  }
  let result = await request(`/api/register/anonimous`, data, createOption(query, 'weapi'))
  if (result.body.code === 200) {
    result = {
      status: 200,
      body: {
        ...result.body,
        cookie: result.cookie.join(';'),
      },
      cookie: result.cookie,
    }
  }
  return result
}

export default async function migratedRegisterAnonimous(
  query: RegisterAnonymousQuery,
  request: ModuleRequest,
): Promise<NcmApiResponse> {
  try {
    return normalizeLegacyModuleResponse(await legacyModule(query, request))
  } catch (error) {
    throw normalizeLegacyModuleError(error)
  }
}
