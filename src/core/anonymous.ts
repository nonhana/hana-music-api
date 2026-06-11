import { createHash } from 'node:crypto'

import type { FetchLike } from '../types/index.ts'

import { createRequest } from './request.ts'
import { getRuntimeState, setRuntimeState } from './runtime.ts'
import { cookieToJson, generateDeviceId, generateRandomChineseIP } from './utils.ts'

const ID_XOR_KEY = '3go8&$8*3*3h0k(2)2'

export interface AnonymousRegistration {
  readonly anonymousToken: string
  readonly cnIp: string
  readonly deviceId: string
}

export interface EnsureAnonymousTokenOptions {
  readonly fetcher?: FetchLike
}

let inflight: Promise<string> | null = null

// register/anonimous 的 username:deviceId XOR 固定 key 后 md5(base64),再与原 deviceId 拼接后整体 base64。
function createAnonymousUsername(deviceId: string): string {
  let xored = ''
  for (let index = 0; index < deviceId.length; index += 1) {
    xored += String.fromCharCode(
      deviceId.charCodeAt(index) ^ ID_XOR_KEY.charCodeAt(index % ID_XOR_KEY.length),
    )
  }
  const digest = createHash('md5').update(xored, 'utf8').digest('base64')

  return Buffer.from(`${deviceId} ${digest}`, 'utf8').toString('base64')
}

export async function registerAnonymousToken(
  options: {
    readonly cnIp?: string
    readonly deviceId?: string
    readonly fetcher?: FetchLike
  } = {},
): Promise<AnonymousRegistration> {
  const deviceId = options.deviceId ?? generateDeviceId()
  const cnIp = options.cnIp ?? generateRandomChineseIP()
  const result = await createRequest(
    '/api/register/anonimous',
    {
      username: createAnonymousUsername(deviceId),
    },
    {
      crypto: 'weapi',
      fetcher: options.fetcher,
      ip: cnIp,
      state: {
        cnIp,
        deviceId,
      },
    },
  )
  const cookie = cookieToJson(result.cookie.join('; '))

  return {
    anonymousToken: String(cookie.MUSIC_A ?? ''),
    cnIp,
    deviceId,
  }
}

export async function ensureRuntimeAnonymousToken(
  options: EnsureAnonymousTokenOptions = {},
): Promise<string> {
  const current = getRuntimeState().anonymousToken
  if (current) {
    return current
  }

  if (inflight) {
    return inflight
  }

  inflight = registerAnonymousToken({
    fetcher: options.fetcher,
  })
    .then((registration) => {
      if (registration.anonymousToken) {
        setRuntimeState({
          anonymousToken: registration.anonymousToken,
          cnIp: registration.cnIp,
          deviceId: registration.deviceId,
        })
      }

      return registration.anonymousToken
    })
    .finally(() => {
      inflight = null
    })

  return inflight
}
