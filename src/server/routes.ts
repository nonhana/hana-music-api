import type { Context, Hono } from 'hono'

import type {
  CreateRequestOptions,
  CreateServerOptions,
  ModuleDefinition,
  ModuleQuery,
  ModuleRequest,
  NcmApiResponse,
} from '../types/index.ts'

import { MemoryResponseCache } from '../core/cache.ts'
import { createRequest } from '../core/request.ts'
import { getRuntimeState } from '../core/runtime.ts'
import { cookieToJson } from '../core/utils.ts'
import { appendResponseCookies, parseRequestCookies } from './cookies.ts'
import { parseRequestBody } from './parse-body.ts'

const DEFAULT_SERVICE_NAME = 'hana-music-api'
const DEFAULT_SERVICE_VERSION = 'phase-6'

export interface RegisteredRouteContext {
  readonly cache: MemoryResponseCache | null
  readonly requestHandler: ModuleRequest
}

/**
 * 注册基础元信息路由。
 */
export function registerBaseRoutes(app: Hono, options: CreateServerOptions = {}): void {
  const serviceName = options.serviceName ?? DEFAULT_SERVICE_NAME
  const serviceVersion = options.serviceVersion ?? DEFAULT_SERVICE_VERSION

  app.get('/', (context) => {
    return context.json({
      message: 'hana-music-api phase 6 finalization baseline is ready',
      name: serviceName,
      phase: 6,
      ready: true,
    })
  })

  app.get('/health', (context) => {
    return context.json({
      name: serviceName,
      ok: true,
      version: serviceVersion,
    })
  })
}

/**
 * 注册模块路由。
 * 这里显式保留了旧项目的三个关键约定：
 * 1. 请求头 Cookie 会先作为默认 cookie 注入；
 * 2. query/body 里的 cookie 字段如果存在，会覆盖请求头 cookie；
 * 3. response cookie 会在 HTTPS 请求下自动补上 SameSite=None; Secure。
 */
export function registerModuleRoutes(
  app: Hono,
  moduleDefinitions: ModuleDefinition[],
  options: RegisteredRouteContext,
): void {
  for (const moduleDefinition of moduleDefinitions) {
    app.all(moduleDefinition.route, async (context) => {
      const query = await buildModuleQuery(context)
      // 根据一次请求的 method、route、query 生成一个唯一的缓存 key
      const cacheKey = options.cache
        ? createReqCacheKey(context.req.method, moduleDefinition.route, query)
        : null
      // 根据缓存 key 从缓存中获取缓存数据
      const cached = cacheKey ? (options.cache?.get(cacheKey) ?? null) : null

      if (cached) {
        return toResponse(context, cached, query)
      }

      try {
        const moduleResponse = await moduleDefinition.module(
          query,
          createServerRequestHandler(context, options.requestHandler),
        )

        if (cacheKey && moduleResponse.status === 200) {
          options.cache?.set(cacheKey, moduleResponse)
        }

        return toResponse(context, moduleResponse, query)
      } catch (error) {
        const moduleResponse = normalizeErrorResponse(error)
        console.error('[ERR]', context.req.url, {
          body: moduleResponse.body,
          status: moduleResponse.status,
        })

        return toResponse(context, moduleResponse, query)
      }
    })
  }
}

// 将 cookie、query、body 合并成一个纯粹的 JS 对象，不依赖框架细节
async function buildModuleQuery(context: Context): Promise<ModuleQuery> {
  const requestCookies = parseRequestCookies(context.req.header('cookie'))
  const query = Object.fromEntries(new URL(context.req.url).searchParams.entries())
  const body = await parseRequestBody(context)

  normalizeCookieField(query)
  normalizeCookieField(body)

  return {
    cookie: requestCookies,
    ...query,
    ...body,
  }
}

function normalizeCookieField(query: ModuleQuery): void {
  if (typeof query.cookie === 'string') {
    query.cookie = cookieToJson(safeDecodeURIComponent(query.cookie))
  }
}

// 专门处理 ip 获取问题
function createServerRequestHandler(
  context: Context,
  requestHandler: ModuleRequest,
): ModuleRequest {
  return (uri, data, options = {}) => {
    const requestOptions: CreateRequestOptions = {
      ...options,
      ip: options.ip ?? resolveClientIp(context),
    }

    return requestHandler(uri, data, requestOptions)
  }
}

function toResponse(
  context: Context,
  moduleResponse: NcmApiResponse,
  query: ModuleQuery,
): Response {
  if (moduleResponse.body === undefined) {
    return createJsonResponse(
      {
        code: 404,
        data: null,
        msg: 'Not Found',
      },
      404,
      context.res.headers,
    )
  }

  if (shouldWriteCookies(query) && moduleResponse.cookie.length > 0) {
    appendResponseCookies(context.res.headers, moduleResponse.cookie, isHttpsRequest(context))
  }

  if (
    moduleResponse.status !== 200 &&
    typeof moduleResponse.body === 'object' &&
    moduleResponse.body !== null &&
    'code' in moduleResponse.body &&
    moduleResponse.body.code === '301'
  ) {
    ;(moduleResponse.body as Record<string, unknown>).msg = '需要登录'
  }

  return createJsonResponse(moduleResponse.body, moduleResponse.status, context.res.headers)
}

function normalizeErrorResponse(error: unknown): NcmApiResponse {
  if (isNcmApiResponse(error)) {
    return error
  }

  return {
    body: {
      code: 500,
      msg: error instanceof Error ? error.message : String(error),
    },
    cookie: [],
    status: 500,
  }
}

function isNcmApiResponse(value: unknown): value is NcmApiResponse {
  return (
    typeof value === 'object' &&
    value !== null &&
    'status' in value &&
    'body' in value &&
    'cookie' in value
  )
}

function shouldWriteCookies(query: ModuleQuery): boolean {
  return (
    query.noCookie !== true &&
    query.noCookie !== 1 &&
    query.noCookie !== 'true' &&
    query.noCookie !== '1'
  )
}

function isHttpsRequest(context: Context): boolean {
  const forwardedProto = context.req.header('x-forwarded-proto')
  if (forwardedProto?.toLowerCase() === 'https') {
    return true
  }

  return new URL(context.req.url).protocol === 'https:'
}

// 从请求头中提取客户端 IP
function resolveClientIp(context: Context): string {
  const forwardedFor = context.req.header('x-forwarded-for')
  const realIp = context.req.header('x-real-ip')
  const candidate = forwardedFor?.split(',')[0]?.trim() || realIp || '::1'

  // 1. 如果客户端 IP 以 "::ffff:" 开头，则去掉前缀（将 IPv6 地址转换为 IPv4 地址）
  if (candidate.startsWith('::ffff:')) {
    return candidate.slice(7)
  }

  // 2. 如果客户端 IP 是 "::1"，则使用备用 IP（通常是本地回环地址）
  if (candidate === '::1') {
    return createRequestStateFallbackIp()
  }

  return candidate
}

function createRequestStateFallbackIp(): string {
  return getRuntimeState().cnIp
}

function createReqCacheKey(method: string, route: string, query: ModuleQuery): string {
  return `${method.toUpperCase()}:${route}:${stableSerialize(query)}`
}

function stableSerialize(value: unknown): string {
  if (Array.isArray(value)) {
    return `[${value.map(stableSerialize).join(',')}]`
  }

  if (value instanceof File) {
    return `File(${value.name}:${value.size}:${value.type})`
  }

  if (isRecordLike(value)) {
    const entries = Object.entries(value).toSorted(([left], [right]) => left.localeCompare(right))

    return `{${entries
      .map(([key, entryValue]) => `${key}:${stableSerialize(entryValue)}`)
      .join(',')}}`
  }

  return JSON.stringify(value)
}

function safeDecodeURIComponent(value: string): string {
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}

export function createDefaultRequestHandler(): ModuleRequest {
  // oxlint-disable-next-line typescript-eslint/no-unsafe-type-assertion -- ModuleRequest is the typed facade used across migrated modules.
  return createRequest as ModuleRequest
}

// 创建原生 Response 对象，设置 Content-Type 为 application/json; charset=utf-8
function createJsonResponse(body: unknown, status: number, headers: Headers): Response {
  const responseHeaders = new Headers(headers)
  responseHeaders.set('Content-Type', 'application/json; charset=utf-8')

  return new Response(JSON.stringify(body), {
    headers: responseHeaders,
    status,
  })
}

function isRecordLike(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}
