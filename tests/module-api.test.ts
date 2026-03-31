import { describe, expect, test } from 'bun:test'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import type {
  CreateRequestOptions,
  DynamicProgrammaticApi,
  ModuleDefinition,
  ProgrammaticModuleInvoker,
} from '../src/types/index.ts'
import type { ModuleRequest } from '../src/types/index.ts'

import { createModuleApi, invokeModule, loadProgrammaticApi } from '../src/app/module-api.ts'

const REAL_MODULES_DIRECTORY = resolve(dirname(fileURLToPath(import.meta.url)), '../src/modules')

describe('programmatic module api', () => {
  const moduleDefinitions: ModuleDefinition[] = [
    {
      identifier: 'search',
      module: async (query, request) => {
        const upstream = await request(
          '/api/search/get',
          {
            keyword: query.keyword,
            keywords: query.keywords,
          },
          {
            cookie: readCookieRecord(query.cookie),
          },
        )

        return {
          body: {
            query,
            upstream,
          },
          cookie: [],
          status: 200,
        }
      },
      route: '/search',
    },
  ]

  test('should expose eagerly loaded module invokers', async () => {
    const api = await loadProgrammaticApi({
      moduleDefinitions,
      requestHandler: asModuleRequest(async (_uri, _data, options = {}) => {
        return {
          body: {
            code: 200,
            cookie: options.cookie,
          },
          cookie: [],
          status: 200,
        }
      }),
    })

    const search = getProgrammaticInvoker(api, 'search')
    const response = await search({
      cookie: 'MUSIC_U=test-cookie',
      keywords: 'hello',
    })

    expect(response.status).toBe(200)
    expect(response.body).toEqual({
      query: {
        cookie: {
          MUSIC_U: 'test-cookie',
        },
        keywords: 'hello',
      },
      upstream: {
        body: {
          code: 200,
          cookie: {
            MUSIC_U: 'test-cookie',
          },
        },
        cookie: [],
        status: 200,
      },
    })
  })

  test('should expose lazy proxy invokers', async () => {
    const api = createModuleApi({
      moduleDefinitions,
      requestHandler: asModuleRequest(async () => {
        return {
          body: {
            code: 200,
          },
          cookie: [],
          status: 200,
        }
      }),
    })

    const search = getProgrammaticInvoker(api, 'search')
    const response = await search({
      keywords: 'proxy-call',
    })

    expect(response.status).toBe(200)
    expect(readKeywordFromBody(response.body)).toBe('proxy-call')
  })

  test('should allow direct invocation by identifier', async () => {
    const response = await invokeModule(
      'search',
      {
        keywords: 'invoke',
      },
      {
        moduleDefinitions,
        requestHandler: asModuleRequest(async () => {
          return {
            body: {
              code: 200,
            },
            cookie: [],
            status: 200,
          }
        }),
      },
    )

    expect(response.status).toBe(200)
    expect(readKeywordFromBody(response.body)).toBe('invoke')
  })

  test('should load real migrated modules for programmatic invocation', async () => {
    const captured: {
      data?: Record<string, unknown>
      options?: CreateRequestOptions
      uri?: string
    } = {}
    const api = await loadProgrammaticApi({
      modulesDirectory: REAL_MODULES_DIRECTORY,
      requestHandler: asModuleRequest(async (uri, data, options = {}) => {
        captured.uri = uri
        captured.data = data
        captured.options = options

        return {
          body: {
            code: 200,
            result: {
              songs: [],
            },
          },
          cookie: [],
          status: 200,
        }
      }),
    })

    const search = getProgrammaticInvoker(api, 'search')
    const response = await search({
      cookie: 'MUSIC_U=real-cookie',
      keywords: 'phase-5',
      limit: 5,
      offset: 2,
    })

    expect(captured.uri).toBe('/api/search/get')
    expect(captured.data).toEqual({
      limit: 5,
      offset: 2,
      s: 'phase-5',
      type: 1,
    })
    expect(captured.options?.cookie).toEqual({
      MUSIC_U: 'real-cookie',
    })
    expect(response.status).toBe(200)
    expect(response.body).toEqual({
      code: 200,
      result: {
        songs: [],
      },
    })
  })

  test('should support typed comment module identifiers in the real module registry', async () => {
    const captured: {
      data?: Record<string, unknown>
      options?: CreateRequestOptions
      uri?: string
    } = {}

    const response = await invokeModule(
      'comment_music',
      {
        before: 10,
        cookie: 'MUSIC_U=comment-cookie',
        id: 12345,
        limit: 30,
        offset: 5,
      },
      {
        requestHandler: asModuleRequest(async (uri, data, options = {}) => {
          captured.uri = uri
          captured.data = data
          captured.options = options

          return {
            body: {
              code: 200,
              comments: [],
            },
            cookie: [],
            status: 200,
          }
        }),
      },
    )

    expect(captured.uri).toBe('/api/v1/resource/comments/R_SO_4_12345')
    expect(captured.data).toEqual({
      beforeTime: 10,
      limit: 30,
      offset: 5,
      rid: 12345,
    })
    expect(captured.options?.cookie).toEqual({
      MUSIC_U: 'comment-cookie',
    })
    expect(response.status).toBe(200)
  })

  test('should support typed user detail module identifiers in the real module registry', async () => {
    const captured: {
      data?: Record<string, unknown>
      options?: CreateRequestOptions
      uri?: string
    } = {}

    const response = await invokeModule(
      'user_detail',
      {
        cookie: 'MUSIC_U=user-detail-cookie',
        uid: 67890,
      },
      {
        requestHandler: asModuleRequest(async (uri, data, options = {}) => {
          captured.uri = uri
          captured.data = data
          captured.options = options

          return {
            body: {
              code: 200,
              profile: {
                avatarImgId_str: '1',
              },
            },
            cookie: [],
            status: 200,
          }
        }),
      },
    )

    expect(captured.uri).toBe('/api/v1/user/detail/67890')
    expect(captured.data).toEqual({})
    expect(captured.options?.cookie).toEqual({
      MUSIC_U: 'user-detail-cookie',
    })
    expect(response.status).toBe(200)
    expect(response.body).toEqual({
      code: 200,
      profile: {
        avatarImgIdStr: '1',
      },
    })
  })
})

function getProgrammaticInvoker(
  api: DynamicProgrammaticApi,
  identifier: string,
): ProgrammaticModuleInvoker {
  const candidate = api[identifier]
  if (typeof candidate !== 'function') {
    throw new TypeError(`Expected "${identifier}" to be a callable programmatic module`)
  }

  return candidate
}

function readCookieRecord(value: unknown): Record<string, string> | undefined {
  if (!isStringRecord(value)) {
    return undefined
  }

  return value
}

function readKeywordFromBody(value: unknown): string {
  if (!isRecordLike(value)) {
    throw new TypeError('Expected response body to be an object')
  }

  const query = value.query
  if (!isRecordLike(query) || typeof query.keywords !== 'string') {
    throw new TypeError('Expected response body to contain query.keywords')
  }

  return query.keywords
}

function isRecordLike(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isStringRecord(value: unknown): value is Record<string, string> {
  return (
    isRecordLike(value) &&
    Object.values(value).every((entry) => {
      return typeof entry === 'string'
    })
  )
}

function asModuleRequest(
  handler: (
    uri: string,
    data: Record<string, unknown>,
    options?: CreateRequestOptions,
  ) => Promise<{
    body: unknown
    cookie: string[]
    status: number
  }>,
): ModuleRequest {
  return handler as ModuleRequest
}
