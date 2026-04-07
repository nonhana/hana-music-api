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
const WELCOME_PAGE_STYLE = `
  :root {
    color-scheme: light;
    --page-background: #f6f8fb;
    --panel-background: rgba(255, 255, 255, 0.92);
    --panel-border: rgba(15, 23, 42, 0.08);
    --panel-shadow: 0 20px 50px rgba(15, 23, 42, 0.08);
    --text-strong: #0f172a;
    --text-body: #334155;
    --text-muted: #64748b;
    --brand: #2563eb;
    --brand-hover: #1d4ed8;
    --brand-soft: rgba(37, 99, 235, 0.12);
    --font-sans: "IBM Plex Sans", "Noto Sans SC", "Microsoft YaHei", sans-serif;
    font-family: var(--font-sans);
  }

  * {
    box-sizing: border-box;
  }

  body {
    margin: 0;
    min-height: 100vh;
    background:
      radial-gradient(circle at top left, rgba(37, 99, 235, 0.1), transparent 32%),
      linear-gradient(180deg, #ffffff 0%, var(--page-background) 55%);
    color: var(--text-body);
  }

  main {
    min-height: 100vh;
    display: grid;
    place-items: center;
    padding: 32px 20px;
  }

  .panel {
    width: min(680px, 100%);
    padding: 40px;
    border-radius: 28px;
    background: var(--panel-background);
    box-shadow: var(--panel-shadow);
    border: 1px solid var(--panel-border);
  }

  .eyebrow {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 6px 12px;
    border-radius: 999px;
    background: var(--brand-soft);
    color: var(--brand);
    font-size: 13px;
    font-weight: 700;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  h1 {
    margin: 20px 0 16px;
    font-size: clamp(36px, 6vw, 56px);
    line-height: 1.08;
    color: var(--text-strong);
  }

  p {
    margin: 0;
    font-size: 17px;
    line-height: 1.8;
    color: var(--text-body);
  }

  .actions {
    display: flex;
    flex-wrap: wrap;
    gap: 14px;
    margin-top: 28px;
  }

  .action {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 168px;
    padding: 14px 20px;
    border-radius: 16px;
    text-decoration: none;
    font-weight: 700;
    transition:
      transform 160ms ease,
      box-shadow 160ms ease,
      background 160ms ease;
  }

  .action:hover {
    transform: translateY(-1px);
  }

  .action-primary {
    background: linear-gradient(135deg, var(--brand) 0%, var(--brand-hover) 100%);
    color: white;
    box-shadow: 0 16px 32px rgba(37, 99, 235, 0.2);
  }

  .action-secondary {
    background: var(--brand-soft);
    color: var(--brand);
  }

  .helper-text {
    margin-top: 20px;
    font-size: 0.95rem;
    color: var(--text-muted);
  }

  .helper-text a {
    color: var(--brand);
    text-decoration: none;
    font-weight: 600;
  }

  @media (max-width: 640px) {
    .panel {
      padding: 28px 22px;
      border-radius: 22px;
    }

    .actions {
      flex-direction: column;
    }

    .action {
      width: 100%;
    }
  }
`

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
    return context.html(
      createWelcomePage({
        docsPath: '/docs',
        healthPath: '/health',
        name: serviceName,
      }),
    )
  })

  app.get('/health', (context) => {
    return context.json({
      name: serviceName,
      ok: true,
      version: serviceVersion,
    })
  })
}

interface WelcomePageOptions {
  readonly docsPath: string
  readonly healthPath: string
  readonly name: string
}

function createWelcomePage(options: WelcomePageOptions): string {
  return `<!DOCTYPE html>
<html lang="zh-CN">
  <head>
    <meta charset="utf-8" />
    <meta content="width=device-width, initial-scale=1" name="viewport" />
    <title>${options.name}</title>
    <meta
      content="${options.name} 服务已启动，可从这里进入文档站和 Demo 调试页。"
      name="description"
    />
    <style>${WELCOME_PAGE_STYLE}</style>
  </head>
  <body>
    <main>
      <section class="panel">
        <div class="eyebrow">HANA Music API</div>
        <h1>${options.name}</h1>
        <p>
          服务已经启动。你可以先查看接口文档，或直接进入 Demo 页面体验常用能力。
        </p>
        <div class="actions">
          <a class="action action-primary" href="${options.docsPath}">查看文档</a>
          <a class="action action-secondary" href="/demo">打开 Demo</a>
        </div>
        <p class="helper-text">服务状态检查请访问 <a href="${options.healthPath}">${options.healthPath}</a></p>
      </section>
    </main>
  </body>
</html>`
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
