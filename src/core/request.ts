import type {
  CookieRecord,
  CreateRequestOptions,
  FetchLike,
  NcmApiResponse,
  RequestCrypto,
  RuntimeState,
} from '../types/index.ts'
import type { DynamicJsonRecord, UpstreamBody } from '../types/upstream.ts'

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
type ActiveConnectionStrategy = 'default' | 'close'
interface NormalizedRetryOptions {
  readonly backoffMs: number
  readonly jitter: boolean
  readonly maxAttempts: number
  readonly maxBackoffMs: number
  readonly retryNonIdempotent: boolean
  readonly statusCodes: ReadonlySet<number>
}

const DEFAULT_RETRIES = 2
const DEFAULT_RETRY_BACKOFF_MS = 300
const DEFAULT_RETRY_MAX_BACKOFF_MS = 2_000
const DEFAULT_TIMEOUT_MS = 8_000
const MAX_RETRIES = 5
const WNMCID = createWnmcid()

export async function createRequest(
  uri: string,
  data: RequestPayload,
  options: CreateRequestOptions = {},
): Promise<NcmApiResponse> {
  const headers: Record<string, string> = {
    ...options.headers,
  }
  const fetcher: FetchLike = options.fetcher ?? fetch
  const state = getRuntimeState(options.state)
  // 调用方未显式给 ip/realIP 时回退到进程级 cnIp。SDK 链路据此默认获得中国区伪装 IP,
  // HTTP server 始终显式传 ip,不受影响。
  const ip = options.realIP ?? options.ip ?? state.cnIp

  if (ip) {
    headers['X-Forwarded-For'] = ip
    headers['X-Real-IP'] = ip
  }
  const cookieInput =
    typeof options.cookie === 'string' ? cookieToJson(options.cookie) : { ...options.cookie }
  const cookie = processCookieObject(cookieInput, uri, state)
  headers.Cookie = cookieObjToString(cookie)

  const csrfToken = String(cookie['__csrf'] ?? '')
  const crypto = resolveCrypto(options.crypto)
  const payload = {
    ...data,
  }
  // e_r 决定服务端是否返回加密响应。旧项目对所有 crypto 统一注入该标记,
  // 并对 eapi / weapi 两种加密都做响应解密,这里保持同样语义。
  const encryptResponse = toBoolean(
    options.e_r !== undefined
      ? options.e_r
      : (readBooleanLike(payload.e_r) ?? APP_CONF.encryptResponse),
  )
  payload.e_r = encryptResponse

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

  const retry = normalizeRetryOptions(options.retry)
  let forceFreshConnection = false

  for (let attempt = 1; attempt <= retry.maxAttempts; attempt += 1) {
    const connectionStrategy = resolveAttemptConnectionStrategy(
      options.connectionStrategy,
      forceFreshConnection,
      attempt,
    )
    const startedAt = Date.now()
    let didTimeout = false
    let timeoutId: ReturnType<typeof setTimeout> | undefined
    // 未显式配置时给一个保守默认超时,避免高并发下挂死连接拖垮整体吞吐;
    // 显式传 0 / 负数仍按禁用处理(normalizeTimeoutMs 对 <=0 返回 undefined)。
    const timeoutMs = normalizeTimeoutMs(options.timeoutMs ?? DEFAULT_TIMEOUT_MS)
    const controller = timeoutMs === undefined ? undefined : new AbortController()

    if (controller && timeoutMs !== undefined) {
      timeoutId = setTimeout(() => {
        didTimeout = true
        controller.abort()
      }, timeoutMs)
    }

    options.onRequestEvent?.({
      attempt,
      connectionStrategy,
      crypto,
      maxAttempts: retry.maxAttempts,
      type: 'attempt',
      url,
    })

    try {
      const response = await fetcher(
        url,
        createFetchInit(
          headers,
          requestBody,
          options.proxy,
          controller?.signal,
          connectionStrategy,
        ),
      )
      if (timeoutId) {
        clearTimeout(timeoutId)
      }

      const answer: NcmApiResponse = {
        body: {},
        cookie: getSetCookies(response.headers).map(stripCookieDomain),
        status: 500,
      }

      if ((crypto === 'eapi' || crypto === 'weapi') && encryptResponse) {
        const encryptedBody = Buffer.from(await response.arrayBuffer())
          .toString('hex')
          .toUpperCase()
        answer.body = normalizeUpstreamBody(
          eapiResDecrypt(encryptedBody, headers['x-aeapi'] === 'true'),
        )
      } else {
        answer.body = normalizeUpstreamBody(await parseResponseBody(response))
      }

      const bodyRecord = isRecord(answer.body)
        ? (answer.body as Record<string, unknown>)
        : undefined

      if (bodyRecord?.code !== undefined) {
        bodyRecord.code = Number(bodyRecord.code)
        answer.status = Number(bodyRecord.code)
      } else {
        answer.status = response.status
      }

      if (bodyRecord && SPECIAL_STATUS_CODES.has(Number(bodyRecord.code))) {
        answer.status = 200
      }

      answer.status = answer.status > 100 && answer.status < 600 ? answer.status : 400

      if (answer.status === 200) {
        return answer
      }

      const durationMs = Date.now() - startedAt
      if (canRetry(retry, attempt) && retry.statusCodes.has(answer.status)) {
        const delayMs = getRetryDelay(retry, attempt)
        options.onRequestEvent?.({
          attempt,
          connectionStrategy,
          crypto,
          delayMs,
          durationMs,
          maxAttempts: retry.maxAttempts,
          status: answer.status,
          type: 'retry',
          url,
        })
        await sleep(delayMs)
        continue
      }

      options.onRequestEvent?.({
        attempt,
        connectionStrategy,
        crypto,
        durationMs,
        maxAttempts: retry.maxAttempts,
        status: answer.status,
        type: 'failure',
        url,
      })
      console.error('[ERR]', answer)
      throw answer
    } catch (error) {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }

      if (isNcmApiResponse(error)) {
        throw error
      }

      const durationMs = Date.now() - startedAt
      const message =
        didTimeout && timeoutMs !== undefined
          ? `Request timed out after ${timeoutMs}ms`
          : error instanceof Error
            ? error.message
            : String(error)
      const answer: NcmApiResponse<DynamicJsonRecord> = {
        body: {
          attempt,
          attempts: retry.maxAttempts,
          code: didTimeout ? 504 : 502,
          crypto,
          durationMs,
          msg: message,
          url,
        },
        cookie: [],
        status: didTimeout ? 504 : 502,
      }

      const isRetryableError = didTimeout || isTransientTransportError(error)
      if (isRetryableError && (didTimeout || shouldUseFreshConnection(error))) {
        forceFreshConnection = true
      }

      if (isRetryableError && canRetry(retry, attempt)) {
        const delayMs = getRetryDelay(retry, attempt)
        options.onRequestEvent?.({
          attempt,
          connectionStrategy,
          crypto,
          delayMs,
          durationMs,
          error: message,
          maxAttempts: retry.maxAttempts,
          type: 'retry',
          url,
        })
        await sleep(delayMs)
        continue
      }

      options.onRequestEvent?.({
        attempt,
        connectionStrategy,
        crypto,
        durationMs,
        error: message,
        maxAttempts: retry.maxAttempts,
        type: 'failure',
        url,
      })
      console.error('[ERR]', answer)
      throw answer
    }
  }

  throw {
    body: {
      code: 502,
      msg: 'Request failed before execution',
    },
    cookie: [],
    status: 502,
  } satisfies NcmApiResponse
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
    _ntes_nnid: String(cookie['_ntes_nnid'] ?? `${randomNuid},${Date.now()}`),
    _ntes_nuid: String(cookie['_ntes_nuid'] ?? randomNuid),
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
  signal: AbortSignal | undefined,
  connectionStrategy: ActiveConnectionStrategy,
): BunFetchInit {
  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/x-www-form-urlencoded',
    ...headers,
  }

  if (connectionStrategy === 'close') {
    requestHeaders.Connection = 'close'
  }

  const init: BunFetchInit = {
    body: new URLSearchParams(data).toString(),
    headers: requestHeaders,
    method: 'POST',
  }

  if (signal) {
    init.signal = signal
  }

  if (proxy) {
    if (proxy.includes('pac')) {
      throw new Error('PAC proxy is not supported by the current Bun fetch adapter')
    }

    init.proxy = proxy
  }

  return init
}

function normalizeRetryOptions(options: CreateRequestOptions['retry']): NormalizedRetryOptions {
  const retries =
    options === undefined ? 0 : clampInteger(options.retries ?? DEFAULT_RETRIES, 0, MAX_RETRIES)
  const retryNonIdempotent = options?.retryNonIdempotent === true

  return {
    backoffMs: clampInteger(options?.backoffMs ?? DEFAULT_RETRY_BACKOFF_MS, 0, 60_000),
    jitter: options?.jitter ?? true,
    maxAttempts: retryNonIdempotent ? retries + 1 : 1,
    maxBackoffMs: clampInteger(options?.maxBackoffMs ?? DEFAULT_RETRY_MAX_BACKOFF_MS, 0, 60_000),
    retryNonIdempotent,
    statusCodes: new Set(
      (options?.statusCodes ?? []).filter((status) => {
        return Number.isInteger(status) && status >= 100 && status < 600
      }),
    ),
  }
}

function normalizeTimeoutMs(value: number | undefined): number | undefined {
  if (value === undefined || !Number.isFinite(value) || value <= 0) {
    return undefined
  }

  return Math.floor(value)
}

function resolveAttemptConnectionStrategy(
  strategy: CreateRequestOptions['connectionStrategy'],
  forceFreshConnection: boolean,
  attempt: number,
): ActiveConnectionStrategy {
  if (
    strategy === 'close' ||
    forceFreshConnection ||
    (strategy === 'fresh-on-retry' && attempt > 1)
  ) {
    return 'close'
  }

  return 'default'
}

function canRetry(retry: NormalizedRetryOptions, attempt: number): boolean {
  return retry.retryNonIdempotent && attempt < retry.maxAttempts
}

function getRetryDelay(retry: NormalizedRetryOptions, attempt: number): number {
  const baseDelay = Math.min(retry.backoffMs * 2 ** (attempt - 1), retry.maxBackoffMs)
  if (!retry.jitter || baseDelay <= 0) {
    return baseDelay
  }

  return Math.floor(baseDelay * (0.5 + Math.random()))
}

function sleep(delayMs: number): Promise<void> {
  if (delayMs <= 0) {
    return Promise.resolve()
  }

  return new Promise((resolve) => setTimeout(resolve, delayMs))
}

function isTransientTransportError(error: unknown): boolean {
  const text = collectErrorText(error).toLowerCase()
  return (
    isSocketCloseText(text) ||
    text.includes('aborterror') ||
    text.includes('econnreset') ||
    text.includes('eai_again') ||
    text.includes('etimedout') ||
    text.includes('fetch failed') ||
    text.includes('network') ||
    text.includes('timeout') ||
    text.includes('und_err_connect_timeout')
  )
}

function shouldUseFreshConnection(error: unknown): boolean {
  return isSocketCloseText(collectErrorText(error).toLowerCase())
}

function isSocketCloseText(text: string): boolean {
  return (
    text.includes('socket connection was closed unexpectedly') ||
    text.includes('socket closed') ||
    text.includes('socket hang up') ||
    text.includes('und_err_socket') ||
    text.includes('connection closed') ||
    text.includes('terminated')
  )
}

function collectErrorText(error: unknown, depth = 0): string {
  const text = error instanceof Error ? `${error.name} ${error.message}` : String(error)
  if (depth >= 3 || typeof error !== 'object' || error === null || !('cause' in error)) {
    return text
  }

  const cause = (error as { cause?: unknown }).cause
  if (cause === undefined || cause === error) {
    return text
  }

  return `${text} ${collectErrorText(cause, depth + 1)}`
}

function clampInteger(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) {
    return min
  }

  return Math.min(Math.max(Math.floor(value), min), max)
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

function isNcmApiResponse(error: unknown): error is NcmApiResponse {
  return (
    typeof error === 'object' &&
    error !== null &&
    'body' in error &&
    'cookie' in error &&
    'status' in error
  )
}

function normalizeUpstreamBody(value: unknown): UpstreamBody {
  if (
    value === null ||
    typeof value === 'boolean' ||
    typeof value === 'number' ||
    typeof value === 'string'
  ) {
    return value
  }

  if (Array.isArray(value)) {
    return value as UpstreamBody
  }

  if (isRecord(value)) {
    return value as DynamicJsonRecord
  }

  return {}
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
