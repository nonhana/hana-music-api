import { createHash } from 'node:crypto'

import type { GenerateConfigOptions, NcmApiResponse } from '../types/index.ts'

import { createRequest } from '../core/request.ts'
import { setRuntimeState, writeAnonymousToken } from '../core/runtime.ts'
import { cookieToJson, generateDeviceId, generateRandomChineseIP, isRecord } from '../core/utils.ts'

const ID_XOR_KEY_1 = '3go8&$8*3*3h0k(2)2'

export async function registerAnonymous(
  options: GenerateConfigOptions = {},
): Promise<NcmApiResponse> {
  const deviceId = options.state?.deviceId ?? generateDeviceId()
  const state = {
    anonymousToken: options.state?.anonymousToken ?? '',
    cnIp: options.state?.cnIp ?? generateRandomChineseIP(),
    deviceId,
  }

  setRuntimeState(state)

  const result = await createRequest(
    '/api/register/anonimous',
    {
      username: Buffer.from(`${deviceId} ${cloudmusicDllEncodeId(deviceId)}`, 'utf8').toString(
        'base64',
      ),
    },
    {
      crypto: 'weapi',
      fetcher: options.fetcher,
      state,
    },
  )

  if (isRecord(result.body) && result.body.code === 200) {
    return {
      ...result,
      body: {
        ...result.body,
        cookie: result.cookie.join(';'),
      },
    }
  }

  return result
}

export async function generateConfig(options: GenerateConfigOptions = {}): Promise<string> {
  const cnIp = options.state?.cnIp ?? generateRandomChineseIP()
  setRuntimeState({
    cnIp,
  })

  try {
    const result = await registerAnonymous({
      ...options,
      state: {
        ...options.state,
        cnIp,
      },
    })
    const cookieSource = result.cookie.join('; ')
    const cookie = cookieToJson(cookieSource)
    const token = String(cookie.MUSIC_A ?? '')

    if (token) {
      writeAnonymousToken(token, options.tokenFilePath)
    }

    return token
  } catch (error) {
    console.log(error)
    return ''
  }
}

function cloudmusicDllEncodeId(deviceId: string): string {
  let xoredString = ''

  for (let index = 0; index < deviceId.length; index += 1) {
    const sourceCode = deviceId.charCodeAt(index)
    const keyCode = ID_XOR_KEY_1.charCodeAt(index % ID_XOR_KEY_1.length)
    xoredString += String.fromCharCode(sourceCode ^ keyCode)
  }

  return createHash('md5').update(xoredString, 'utf8').digest('base64')
}
