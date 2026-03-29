import { describe, expect, test } from 'bun:test'

import type { CreateRequestOptions, ModuleDefinition } from '../src/types/index.ts'

import { createServer } from '../src/server/create-server.ts'
import { parseModuleRoute } from '../src/server/module-loader.ts'

async function readJson(response: Response): Promise<unknown> {
  return response.json()
}

describe('createServer', () => {
  test('should expose the phase 0 baseline route', async () => {
    const app = await createServer()
    const response = await app.request('/')
    const body = await readJson(response)

    expect(response.status).toBe(200)
    expect(body).toEqual({
      name: 'hana-music-api',
      phase: 2,
      ready: true,
      message: 'hana-music-api migration baseline is ready',
    })
  })

  test('should expose the health route', async () => {
    const app = await createServer({
      serviceVersion: 'test-version',
    })
    const response = await app.request('/health')
    const body = await readJson(response)

    expect(response.status).toBe(200)
    expect(body).toEqual({
      ok: true,
      name: 'hana-music-api',
      version: 'test-version',
    })
  })

  test('should merge request data and inject client ip into module request adapter', async () => {
    const captured: {
      data?: Record<string, unknown>
      options?: CreateRequestOptions
      uri?: string
    } = {}
    const moduleDefinitions: ModuleDefinition[] = [
      {
        identifier: 'search',
        module: async (query, request) => {
          await request(
            '/api/example',
            {
              hello: 'world',
            },
            {},
          )

          return {
            body: {
              query,
            },
            cookie: ['MUSIC_U=server-cookie; Path=/'],
            status: 200,
          }
        },
        route: '/search',
      },
    ]
    const app = await createServer({
      moduleDefinitions,
      requestHandler: async (uri, data, options = {}) => {
        captured.uri = uri
        captured.data = data
        captured.options = options

        return {
          body: {
            code: 200,
          },
          cookie: [],
          status: 200,
        }
      },
    })
    const response = await app.request('http://localhost/search?keyword=test', {
      body: 'limit=10&cookie=MUSIC_A%3Dbody-token',
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
        cookie: 'MUSIC_U=request-cookie',
        'x-forwarded-for': '8.8.8.8',
      },
      method: 'POST',
    })
    const body = await readModuleQueryBody(response)

    expect(captured.uri).toBe('/api/example')
    expect(captured.data).toEqual({
      hello: 'world',
    })
    expect(captured.options?.ip).toBe('8.8.8.8')
    expect(body.query).toEqual({
      cookie: {
        MUSIC_A: 'body-token',
      },
      keyword: 'test',
      limit: '10',
    })
    expect(response.headers.get('set-cookie')).toContain('MUSIC_U=server-cookie; Path=/')
  })

  test('should append secure cookie attributes for https requests', async () => {
    const moduleDefinitions: ModuleDefinition[] = [
      {
        identifier: 'secure-cookie',
        module: async () => {
          return {
            body: {
              code: 200,
            },
            cookie: ['MUSIC_U=secure-cookie; Path=/'],
            status: 200,
          }
        },
        route: '/secure-cookie',
      },
    ]
    const app = await createServer({
      moduleDefinitions,
    })
    const response = await app.request('https://localhost/secure-cookie')

    expect(response.headers.get('set-cookie')).toContain(
      'MUSIC_U=secure-cookie; Path=/; SameSite=None; Secure',
    )
  })

  test('should cache successful module responses', async () => {
    let invokeCount = 0
    const moduleDefinitions: ModuleDefinition[] = [
      {
        identifier: 'cached-route',
        module: async () => {
          invokeCount += 1

          return {
            body: {
              code: 200,
              invokeCount,
            },
            cookie: [],
            status: 200,
          }
        },
        route: '/cached-route',
      },
    ]
    const app = await createServer({
      cacheTtlMs: 5_000,
      moduleDefinitions,
    })

    const first = await app.request('http://localhost/cached-route?foo=bar')
    const second = await app.request('http://localhost/cached-route?foo=bar')

    expect(await readJson(first)).toEqual({
      code: 200,
      invokeCount: 1,
    })
    expect(await readJson(second)).toEqual({
      code: 200,
      invokeCount: 1,
    })
    expect(invokeCount).toBe(1)
  })
})

async function readModuleQueryBody(
  response: Response,
): Promise<{ readonly query: Record<string, unknown> }> {
  const body = await readJson(response)
  if (isModuleQueryBody(body)) {
    return body
  }

  throw new TypeError('Expected response body to include query object')
}

function isModuleQueryBody(value: unknown): value is { readonly query: Record<string, unknown> } {
  return (
    typeof value === 'object' &&
    value !== null &&
    'query' in value &&
    typeof value.query === 'object' &&
    value.query !== null
  )
}

describe('parseModuleRoute', () => {
  test('should preserve legacy special route mappings', () => {
    expect(parseModuleRoute('daily_signin')).toBe('/daily_signin')
    expect(parseModuleRoute('fm-trash')).toBe('/fm_trash')
    expect(parseModuleRoute('personal_fm')).toBe('/personal_fm')
    expect(parseModuleRoute('song_url')).toBe('/song/url')
  })
})
