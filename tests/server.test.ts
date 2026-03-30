import { describe, expect, test } from 'bun:test'
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import type { CreateRequestOptions, ModuleDefinition } from '../src/types/index.ts'
import type { LegacyUploadedFile } from '../src/types/modules.ts'

import { createServer } from '../src/server/create-server.ts'
import { parseModuleRoute } from '../src/server/module-loader.ts'

const REAL_MODULES_DIRECTORY = resolve(dirname(fileURLToPath(import.meta.url)), '../src/modules')

async function readJson(response: Response): Promise<unknown> {
  return response.json()
}

describe('createServer', () => {
  test('should expose the phase 5 baseline route', async () => {
    const app = await createServer()
    const response = await app.request('/')
    const body = await readJson(response)

    expect(response.status).toBe(200)
    expect(body).toEqual({
      name: 'hana-music-api',
      phase: 5,
      ready: true,
      message: 'hana-music-api phase 5 regression baseline is ready',
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

  test('should normalize multipart uploads into legacy file objects', async () => {
    const moduleDefinitions: ModuleDefinition[] = [
      {
        identifier: 'upload-probe',
        module: async (query) => {
          const songFile = readLegacyUploadedFile(query, 'songFile')

          return {
            body: {
              file: {
                byteLength: toByteLength(songFile.data),
                hasMd5: 'md5' in songFile,
                mimetype: songFile.mimetype,
                name: songFile.name,
                size: songFile.size,
              },
              title: query.title,
            },
            cookie: [],
            status: 200,
          }
        },
        route: '/upload-probe',
      },
    ]
    const app = await createServer({
      moduleDefinitions,
    })
    const formData = new FormData()
    formData.set('title', 'phase5 upload')
    formData.set(
      'songFile',
      new File([Uint8Array.from([1, 2, 3, 4])], 'demo.mp3', {
        type: 'audio/mpeg',
      }),
    )

    const response = await app.request('http://localhost/upload-probe', {
      body: formData,
      method: 'POST',
    })
    const body = await readJson(response)

    expect(response.status).toBe(200)
    expect(body).toEqual({
      file: {
        byteLength: 4,
        hasMd5: false,
        mimetype: 'audio/mpeg',
        name: 'demo.mp3',
        size: 4,
      },
      title: 'phase5 upload',
    })
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

  test('should serve static assets from the configured public directory', async () => {
    const temporaryDirectory = mkdtempSync(join(tmpdir(), 'hana-static-'))
    const docsDirectory = join(temporaryDirectory, 'docs')
    mkdirSync(docsDirectory, {
      recursive: true,
    })
    writeFileSync(join(temporaryDirectory, 'hello.txt'), 'hello static world', 'utf8')
    writeFileSync(join(docsDirectory, 'index.html'), '<h1>docs home</h1>', 'utf8')

    try {
      const app = await createServer({
        moduleDefinitions: [],
        publicDirectory: temporaryDirectory,
      })
      const fileResponse = await app.request('http://localhost/hello.txt')
      const directoryResponse = await app.request('http://localhost/docs')

      expect(fileResponse.status).toBe(200)
      expect(await fileResponse.text()).toBe('hello static world')
      expect(directoryResponse.status).toBe(200)
      expect(await directoryResponse.text()).toContain('docs home')
    } finally {
      rmSync(temporaryDirectory, {
        force: true,
        recursive: true,
      })
    }
  })

  test('should load real migrated modules from the modules directory', async () => {
    const app = await createServer({
      cacheEnabled: false,
      modulesDirectory: REAL_MODULES_DIRECTORY,
      requestHandler: async (uri, data, options = {}) => {
        return {
          body: {
            code: 200,
            data,
            options,
            uri,
          },
          cookie: [],
          status: 200,
        }
      },
    })

    const searchResponse = await app.request('http://localhost/search?keywords=phase5&type=2000')
    const body = await readJson(searchResponse)

    expect(searchResponse.status).toBe(200)
    expect(body).toEqual({
      code: 200,
      data: {
        keyword: 'phase5',
        limit: 30,
        offset: 0,
        scene: 'normal',
      },
      options: {
        checkToken: false,
        cookie: {},
        crypto: '',
        domain: '',
        e_r: undefined,
        ip: expect.any(String),
        proxy: undefined,
        realIP: undefined,
        ua: '',
      },
      uri: '/api/search/voice/get',
    })
  })

  test('should preserve special routes and noCookie semantics with real migrated modules', async () => {
    const app = await createServer({
      cacheEnabled: false,
      modulesDirectory: REAL_MODULES_DIRECTORY,
      requestHandler: async (uri, data, options = {}) => {
        return {
          body: {
            code: 200,
            data,
            options,
            uri,
          },
          cookie: ['MUSIC_U=server-cookie; Path=/'],
          status: 200,
        }
      },
    })

    const personalFm = await app.request('http://localhost/personal_fm?cookie=MUSIC_U%3Dfm-cookie')
    const personalFmBody = await readJson(personalFm)
    const dailySignin = await app.request(
      'http://localhost/daily_signin?type=1&cookie=MUSIC_U%3Dsignin-cookie&noCookie=true',
    )
    const dailySigninBody = await readJson(dailySignin)

    expect(personalFm.status).toBe(200)
    expect(personalFm.headers.get('set-cookie')).toContain('MUSIC_U=server-cookie; Path=/')
    expect(personalFmBody).toEqual({
      code: 200,
      data: {},
      options: {
        checkToken: false,
        cookie: {
          MUSIC_U: 'fm-cookie',
        },
        crypto: 'weapi',
        domain: '',
        e_r: undefined,
        ip: expect.any(String),
        proxy: undefined,
        realIP: undefined,
        ua: '',
      },
      uri: '/api/v1/radio/get',
    })
    expect(dailySignin.status).toBe(200)
    expect(dailySignin.headers.get('set-cookie')).toBeNull()
    expect(dailySigninBody).toEqual({
      code: 200,
      data: {
        type: '1',
      },
      options: {
        checkToken: false,
        cookie: {
          MUSIC_U: 'signin-cookie',
        },
        crypto: '',
        domain: '',
        e_r: undefined,
        ip: expect.any(String),
        proxy: undefined,
        realIP: undefined,
        ua: '',
      },
      uri: '/api/point/dailyTask',
    })
  })

  test('should let real migrated modules override header cookies with body cookies', async () => {
    const app = await createServer({
      cacheEnabled: false,
      modulesDirectory: REAL_MODULES_DIRECTORY,
      requestHandler: async (uri, data, options = {}) => {
        return {
          body: {
            code: 200,
            data,
            options,
            uri,
          },
          cookie: ['MUSIC_U=account-cookie; Path=/'],
          status: 200,
        }
      },
    })
    const response = await app.request('http://localhost/user/account', {
      body: 'cookie=MUSIC_U%3Dbody-cookie',
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
        cookie: 'MUSIC_U=header-cookie',
      },
      method: 'POST',
    })
    const body = await readJson(response)

    expect(response.status).toBe(200)
    expect(response.headers.get('set-cookie')).toContain('MUSIC_U=account-cookie; Path=/')
    expect(body).toEqual({
      code: 200,
      data: {},
      options: {
        checkToken: false,
        cookie: {
          MUSIC_U: 'body-cookie',
        },
        crypto: 'weapi',
        domain: '',
        e_r: undefined,
        ip: expect.any(String),
        proxy: undefined,
        realIP: undefined,
        ua: '',
      },
      uri: '/api/nuser/account/get',
    })
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

function readLegacyUploadedFile(query: Record<string, unknown>, key: string): LegacyUploadedFile {
  const value = query[key]
  if (!isLegacyUploadedFile(value)) {
    throw new TypeError(`Expected "${key}" to be normalized as a legacy uploaded file`)
  }

  return value
}

function isLegacyUploadedFile(value: unknown): value is LegacyUploadedFile {
  return (
    typeof value === 'object' &&
    value !== null &&
    'data' in value &&
    'mimetype' in value &&
    'name' in value &&
    'size' in value
  )
}

function toByteLength(data: LegacyUploadedFile['data']): number {
  if (Buffer.isBuffer(data)) {
    return data.byteLength
  }

  return data instanceof Uint8Array
    ? Buffer.from(data).byteLength
    : Buffer.from(new Uint8Array(data)).byteLength
}

describe('parseModuleRoute', () => {
  test('should preserve legacy special route mappings', () => {
    expect(parseModuleRoute('daily_signin')).toBe('/daily_signin')
    expect(parseModuleRoute('fm-trash')).toBe('/fm_trash')
    expect(parseModuleRoute('personal_fm')).toBe('/personal_fm')
    expect(parseModuleRoute('song_url')).toBe('/song/url')
  })
})
