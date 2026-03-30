import type {
  CookieRecord,
  CreateRequestOptions,
  FetchLike,
  NcmApiResponse,
  RequestCrypto,
  RuntimeState,
} from '../types/index.ts'

import { APP_CONF, OS_PROFILES, SPECIAL_STATUS_CODES, USER_AGENT_MAP } from './config.ts'
import { eapi, eapiResDecrypt, linuxapi, weapi } from './crypto.ts'
import { getRuntimeState } from './runtime.ts'
import { cookieObjToString, cookieToJson, createRandomHex, isRecord, toBoolean } from './utils.ts'

type RequestPayload = Record<string, unknown>
type BunFetchInit = RequestInit & {
  proxy?: string
}
type UserAgentCrypto = 'api' | 'linuxapi' | 'weapi'
type OsProfileKey = keyof typeof OS_PROFILES

const WNMCID = createWnmcid()

export async function createRequest(
  uri: string,
  data: RequestPayload,
  options: CreateRequestOptions = {},
): Promise<NcmApiResponse<Record<string, any>>> {
  const headers: Record<string, string> = {
    ...options.headers,
  }
  const ip = options.realIP ?? options.ip ?? ''

  if (ip) {
    headers['X-Forwarded-For'] = ip
    headers['X-Real-IP'] = ip
  }

  const fetcher: FetchLike = options.fetcher ?? fetch
  const state = getRuntimeState(options.state)
  const cookieInput =
    typeof options.cookie === 'string' ? cookieToJson(options.cookie) : { ...options.cookie }
  const cookie = processCookieObject(cookieInput, uri, state)
  headers.Cookie = cookieObjToString(cookie)

  const csrfToken = String(cookie.__csrf ?? '')
  const crypto = resolveCrypto(options.crypto)
  const payload = {
    ...data,
  }

  let url = ''
  let requestBody: Record<string, string>

  switch (crypto) {
    case 'weapi': {
      headers.Referer = options.domain || APP_CONF.domain
      headers['User-Agent'] = options.ua || chooseUserAgent('weapi', 'pc')
      payload.csrf_token = csrfToken
      requestBody = weapi(payload)
      url = `${options.domain || APP_CONF.domain}/weapi/${uri.slice(5)}`
      break
    }

    case 'linuxapi': {
      headers['User-Agent'] = options.ua || chooseUserAgent('linuxapi', 'linux')
      requestBody = linuxapi({
        method: 'POST',
        params: payload,
        url: `${options.domain || APP_CONF.domain}${uri}`,
      })
      url = `${options.domain || APP_CONF.domain}/api/linux/forward`
      break
    }

    case 'eapi':
    case 'api': {
      const header = createEapiHeader(cookie, csrfToken, options)
      headers.Cookie = createHeaderCookie(header)
      headers['User-Agent'] = options.ua || chooseUserAgent('api', 'iphone')

      if (crypto === 'eapi') {
        payload.header = header
        payload.e_r = toBoolean(
          options.e_r !== undefined
            ? options.e_r
            : (readBooleanLike(payload.e_r) ?? APP_CONF.encryptResponse),
        )
        requestBody = eapi(uri, payload)
        url = `${options.domain || APP_CONF.apiDomain}/eapi/${uri.slice(5)}`
      } else {
        requestBody = stringifyPayload(payload)
        url = `${options.domain || APP_CONF.apiDomain}${uri}`
      }
      break
    }

    default: {
      throw {
        body: {
          code: 500,
          msg: `Unknown crypto mode: ${crypto}`,
        },
        cookie: [],
        status: 500,
      } satisfies NcmApiResponse
    }
  }

  try {
    const response = await fetcher(url, createFetchInit(headers, requestBody, options.proxy))
    const answer: NcmApiResponse<Record<string, any>> = {
      body: {},
      cookie: getSetCookies(response.headers).map(stripCookieDomain),
      status: 500,
    }

    if (crypto === 'eapi' && payload.e_r) {
      const encryptedBody = Buffer.from(await response.arrayBuffer())
        .toString('hex')
        .toUpperCase()
      answer.body = (eapiResDecrypt(encryptedBody, headers['x-aeapi'] === 'true') ?? {}) as Record<
        string,
        any
      >
    } else {
      answer.body = ((await parseResponseBody(response)) ?? {}) as Record<string, any>
    }

    if (isRecord(answer.body) && answer.body.code !== undefined) {
      answer.body.code = Number(answer.body.code)
      answer.status = Number(answer.body.code)
    } else {
      answer.status = response.status
    }

    if (isRecord(answer.body) && SPECIAL_STATUS_CODES.has(Number(answer.body.code))) {
      answer.status = 200
    }

    answer.status = answer.status > 100 && answer.status < 600 ? answer.status : 400

    if (answer.status === 200) {
      return answer
    }

    console.error('[ERR]', answer)
    throw answer
  } catch (error) {
    if (isNcmApiResponse(error)) {
      throw error
    }

    const message = error instanceof Error ? error.message : String(error)
    const answer: NcmApiResponse<Record<string, any>> = {
      body: {
        code: 502,
        msg: message,
      },
      cookie: [],
      status: 502,
    }
    console.error('[ERR]', answer)
    throw answer
  }
}

function resolveCrypto(crypto: RequestCrypto | undefined): RequestCrypto {
  if (crypto) {
    return crypto
  }

  return APP_CONF.encrypt ? 'eapi' : 'api'
}

function chooseUserAgent(
  crypto: UserAgentCrypto,
  uaType: 'android' | 'iphone' | 'linux' | 'pc' = 'pc',
): string {
  const config = USER_AGENT_MAP[crypto] as Partial<
    Record<'android' | 'iphone' | 'linux' | 'pc', string>
  >
  if (!config) {
    return ''
  }

  return config[uaType] ?? ''
}

function processCookieObject(cookie: CookieRecord, uri: string, state: RuntimeState): CookieRecord {
  const randomNuid = createRandomHex(32)
  const osKey = getOsProfileKey(cookie.os)
  const osProfile = OS_PROFILES[osKey]
  const processedCookie: CookieRecord = {
    ...cookie,
    __remember_me: 'true',
    _ntes_nnid: String(cookie._ntes_nnid ?? `${randomNuid},${Date.now()}`),
    _ntes_nuid: String(cookie._ntes_nuid ?? randomNuid),
    WEVNSM: String(cookie.WEVNSM ?? '1.0.0'),
    WNMCID: String(cookie.WNMCID ?? WNMCID),
    appver: String(cookie.appver ?? osProfile.appver),
    channel: String(cookie.channel ?? osProfile.channel),
    deviceId: String(cookie.deviceId ?? state.deviceId),
    ntes_kaola_ad: '1',
    os: String(cookie.os ?? osProfile.os),
    osver: String(cookie.osver ?? osProfile.osver),
  }

  if (!uri.includes('login')) {
    processedCookie.NMTID = createRandomHex(16)
  }

  if (!processedCookie.MUSIC_U) {
    processedCookie.MUSIC_A = String(processedCookie.MUSIC_A ?? state.anonymousToken)
  }

  return processedCookie
}

function createHeaderCookie(header: Record<string, string>): string {
  return Object.entries(header)
    .map(([key, value]) => {
      return `${encodeURIComponent(key)}=${encodeURIComponent(value)}`
    })
    .join('; ')
}

function createEapiHeader(
  cookie: CookieRecord,
  csrfToken: string,
  options: CreateRequestOptions,
): Record<string, string> {
  const header: Record<string, string> = {
    __csrf: csrfToken,
    appver: String(cookie.appver ?? ''),
    buildver: String(cookie.buildver ?? `${Date.now()}`.slice(0, 10)),
    channel: String(cookie.channel ?? ''),
    deviceId: String(cookie.deviceId ?? ''),
    mobilename: String(cookie.mobilename ?? ''),
    os: String(cookie.os ?? ''),
    osver: String(cookie.osver ?? ''),
    requestId: generateRequestId(),
    resolution: String(cookie.resolution ?? '1920x1080'),
    versioncode: String(cookie.versioncode ?? '140'),
  }

  if (options.checkToken) {
    header['X-antiCheatToken'] = APP_CONF.checkToken
  }

  if (cookie.MUSIC_A) {
    header.MUSIC_A = String(cookie.MUSIC_A)
  }

  if (cookie.MUSIC_U) {
    header.MUSIC_U = String(cookie.MUSIC_U)
  }

  return header
}

function generateRequestId(): string {
  return `${Date.now()}_${Math.floor(Math.random() * 1000)
    .toString()
    .padStart(4, '0')}`
}

function createFetchInit(
  headers: Record<string, string>,
  data: Record<string, string>,
  proxy: string | undefined,
): BunFetchInit {
  const init: BunFetchInit = {
    body: new URLSearchParams(data).toString(),
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      ...headers,
    },
    method: 'POST',
  }

  if (proxy) {
    if (proxy.includes('pac')) {
      throw new Error('PAC proxy is not supported by the current Bun fetch adapter')
    }

    init.proxy = proxy
  }

  return init
}

async function parseResponseBody(response: Response): Promise<unknown> {
  const contentType = response.headers.get('content-type') ?? ''

  if (contentType.includes('application/json')) {
    return response.json()
  }

  const text = await response.text()

  try {
    return JSON.parse(text) as unknown
  } catch {
    return text
  }
}

function getSetCookies(headers: Headers): string[] {
  const headersWithSetCookie = headers as Headers & {
    getSetCookie?: () => string[]
  }

  if (typeof headersWithSetCookie.getSetCookie === 'function') {
    return headersWithSetCookie.getSetCookie()
  }

  const rawSetCookie = headers.get('set-cookie')
  if (!rawSetCookie) {
    return []
  }

  return splitSetCookieHeader(rawSetCookie)
}

function isNcmApiResponse(error: unknown): error is NcmApiResponse<Record<string, any>> {
  return (
    typeof error === 'object' &&
    error !== null &&
    'body' in error &&
    'cookie' in error &&
    'status' in error
  )
}

function splitSetCookieHeader(headerValue: string): string[] {
  const result: string[] = []
  let current = ''
  let inExpires = false

  for (const character of headerValue) {
    if (character === ',') {
      if (inExpires) {
        current += character
        continue
      }

      result.push(current.trim())
      current = ''
      continue
    }

    current += character

    if (current.endsWith('Expires=')) {
      inExpires = true
    } else if (inExpires && character === ';') {
      inExpires = false
    }
  }

  if (current.trim()) {
    result.push(current.trim())
  }

  return result
}

function stripCookieDomain(cookie: string): string {
  return cookie.replace(/\s*Domain=[^(;|$)]+;*/i, '')
}

function stringifyPayload(payload: RequestPayload): Record<string, string> {
  return Object.fromEntries(
    Object.entries(payload)
      .filter((entry) => entry[1] !== undefined)
      .map(([key, value]) => {
        if (typeof value === 'string') {
          return [key, value]
        }

        if (typeof value === 'number' || typeof value === 'boolean') {
          return [key, String(value)]
        }

        return [key, JSON.stringify(value)]
      }),
  )
}

function createWnmcid(): string {
  let randomString = ''
  const characters = 'abcdefghijklmnopqrstuvwxyz'

  for (let index = 0; index < 6; index += 1) {
    const randomIndex = Math.floor(Math.random() * characters.length)
    randomString += characters[randomIndex] ?? characters[0]
  }

  return `${randomString}.${Date.now()}.01.0`
}

function readBooleanLike(value: unknown): boolean | number | string | undefined {
  if (typeof value === 'boolean' || typeof value === 'number' || typeof value === 'string') {
    return value
  }

  return undefined
}

function getOsProfileKey(value: CookieRecord['os']): OsProfileKey {
  if (value === 'android' || value === 'iphone' || value === 'linux' || value === 'pc') {
    return value
  }

  return 'pc'
}
