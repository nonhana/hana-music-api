import type { Context, Hono } from 'hono'

import { jsxRenderer } from 'hono/jsx-renderer'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import type { ModuleQuery, ModuleRequest, NcmApiResponse } from '../types/index.ts'

import { cookieToJson } from '../core/utils.ts'
import { invokeApiDebugRequest } from '../demo/api-debug-request.ts'
import { apiDebugClientScript } from '../demo/client/api-debug.ts'
import { audioMatchClientScript } from '../demo/client/audio-match.ts'
import { qrLoginClientScript } from '../demo/client/qr-login.ts'
import { searchClientScript } from '../demo/client/search.ts'
import { sharedClientScript } from '../demo/client/shared.ts'
import { uploadPlaylistCoverClientScript } from '../demo/client/upload-playlist-cover.ts'
import { DemoLayout } from '../demo/layouts/demo-layout.tsx'
import { ApiDebugPage } from '../demo/pages/api-debug.tsx'
import { AudioMatchPage } from '../demo/pages/audio-match.tsx'
import { DemoIndexPage } from '../demo/pages/demo-index.tsx'
import { QrLoginPage } from '../demo/pages/qr-login.tsx'
import { SearchPage } from '../demo/pages/search.tsx'
import { UploadPlaylistCoverPage } from '../demo/pages/upload-playlist-cover.tsx'
import { getDemoPageByPath, getGroupedDemoPages } from '../demo/registry.ts'
import { demoStyles } from '../demo/styles/demo.css.ts'
import { appendResponseCookies, parseRequestCookies } from './cookies.ts'
import { parseRequestBody } from './parse-body.ts'
import { bindRequestHandlerToContext } from './routes.ts'

const clientScripts = {
  'api-debug.js': apiDebugClientScript,
  'audio-match.js': audioMatchClientScript,
  'qr-login.js': qrLoginClientScript,
  'search.js': searchClientScript,
  'shared.js': sharedClientScript,
  'upload-playlist-cover.js': uploadPlaylistCoverClientScript,
} as const

const AUDIO_MATCH_ASSET_DIRECTORY = resolve(
  dirname(fileURLToPath(import.meta.url)),
  '../demo/assets/audio-match',
)

const audioMatchAssets = {
  'afp.js': {
    contentType: 'text/javascript; charset=utf-8',
    path: resolve(AUDIO_MATCH_ASSET_DIRECTORY, 'afp.js'),
  },
  'afp.wasm': {
    contentType: 'application/wasm',
    path: resolve(AUDIO_MATCH_ASSET_DIRECTORY, 'afp.wasm'),
  },
  'rec.js': {
    contentType: 'text/javascript; charset=utf-8',
    path: resolve(AUDIO_MATCH_ASSET_DIRECTORY, 'rec.js'),
  },
} as const

function isClientScriptAsset(asset: string): asset is keyof typeof clientScripts {
  return asset in clientScripts
}

function isAudioMatchAsset(asset: string): asset is keyof typeof audioMatchAssets {
  return asset in audioMatchAssets
}

interface DemoRouteOptions {
  readonly requestHandler: ModuleRequest
}

export function registerDemoRoutes(app: Hono, options: DemoRouteOptions): void {
  const renderer = jsxRenderer(({ children }, context) => {
    const page = getDemoPageByPath(context.req.path)

    return (
      <DemoLayout currentPath={context.req.path} page={page}>
        {children}
      </DemoLayout>
    )
  })

  app.use('/demo', renderer)
  app.use('/demo/*', renderer)

  app.get('/demo/styles.css', (context) => {
    return context.body(demoStyles, 200, {
      'Content-Type': 'text/css; charset=utf-8',
    })
  })

  app.get('/demo/client/:asset', (context) => {
    const asset = context.req.param('asset')

    if (!isClientScriptAsset(asset)) {
      return context.notFound()
    }

    const script = clientScripts[asset]

    return context.body(script, 200, {
      'Content-Type': 'text/javascript; charset=utf-8',
    })
  })

  app.get('/demo/assets/audio-match/:asset', (context) => {
    const asset = context.req.param('asset')

    if (!isAudioMatchAsset(asset)) {
      return context.notFound()
    }

    const resource = audioMatchAssets[asset]

    return new Response(Bun.file(resource.path), {
      headers: {
        'Content-Type': resource.contentType,
      },
      status: 200,
    })
  })

  app.get('/demo', (context) => {
    return context.render(<DemoIndexPage groups={getGroupedDemoPages()} />)
  })

  app.get('/demo/api-debug', (context) => {
    return context.render(<ApiDebugPage />)
  })

  app.post('/demo/api-debug/request', async (context) => {
    const query = await buildDemoRouteQuery(context)

    try {
      const moduleResponse = await invokeApiDebugRequest(
        query,
        bindRequestHandlerToContext(context, options.requestHandler),
        readRequestCookies(context),
      )

      return toDemoJsonResponse(context, moduleResponse, query)
    } catch (error) {
      return toDemoJsonResponse(context, normalizeDemoErrorResponse(error), query)
    }
  })

  app.get('/demo/search', (context) => {
    return context.render(<SearchPage />)
  })

  app.get('/demo/qr-login', (context) => {
    return context.render(<QrLoginPage />)
  })

  app.get('/demo/upload/playlist-cover', (context) => {
    return context.render(<UploadPlaylistCoverPage />)
  })

  app.get('/demo/experiments/audio-match', (context) => {
    return context.render(<AudioMatchPage />)
  })
}

async function buildDemoRouteQuery(context: Context): Promise<ModuleQuery> {
  const requestCookies = readRequestCookies(context)
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

function readRequestCookies(context: Context) {
  return parseRequestCookies(context.req.header('cookie'))
}

function normalizeDemoErrorResponse(error: unknown): NcmApiResponse {
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

function toDemoJsonResponse(
  context: Context,
  moduleResponse: NcmApiResponse,
  query: ModuleQuery,
): Response {
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

  const headers = new Headers(context.res.headers)
  headers.set('Content-Type', 'application/json; charset=utf-8')

  return new Response(JSON.stringify(moduleResponse.body), {
    headers,
    status: moduleResponse.status,
  })
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

function isNcmApiResponse(value: unknown): value is NcmApiResponse {
  return (
    typeof value === 'object' &&
    value !== null &&
    'status' in value &&
    'body' in value &&
    'cookie' in value
  )
}

function safeDecodeURIComponent(value: string): string {
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}
