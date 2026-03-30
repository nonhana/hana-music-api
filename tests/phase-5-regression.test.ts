import { describe, expect, test } from 'bun:test'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import type { CreateRequestOptions, ModuleRequest } from '../src/types/index.ts'

import { invokeModule } from '../src/app/module-api.ts'
import { loadModuleDefinitions } from '../src/server/module-loader.ts'

const REAL_MODULES_DIRECTORY = resolve(dirname(fileURLToPath(import.meta.url)), '../src/modules')
const realModuleDefinitionsPromise = loadModuleDefinitions(REAL_MODULES_DIRECTORY)

describe('phase 5 module regression suite', () => {
  test('should keep search and voice-search request shapes aligned with legacy behavior', async () => {
    const requestSpy = createRequestSpy((uri) => {
      return {
        body: {
          code: 200,
          route: uri,
        },
        cookie: [],
        status: 200,
      }
    })

    await invokeRealModule(
      'search',
      {
        keywords: '周杰伦',
        limit: 20,
        offset: 5,
      },
      requestSpy.requestHandler,
    )

    await invokeRealModule(
      'search',
      {
        keywords: '语音搜索',
        type: '2000',
      },
      requestSpy.requestHandler,
    )

    expect(requestSpy.calls).toHaveLength(2)
    expect(requestSpy.calls[0]).toEqual({
      data: {
        limit: 20,
        offset: 5,
        s: '周杰伦',
        type: 1,
      },
      options: {
        checkToken: false,
        cookie: undefined,
        crypto: '',
        domain: '',
        e_r: undefined,
        proxy: undefined,
        realIP: undefined,
        ua: '',
      },
      uri: '/api/search/get',
    })
    expect(requestSpy.calls[1]).toEqual({
      data: {
        keyword: '语音搜索',
        limit: 30,
        offset: 0,
        scene: 'normal',
      },
      options: {
        checkToken: false,
        cookie: undefined,
        crypto: '',
        domain: '',
        e_r: undefined,
        proxy: undefined,
        realIP: undefined,
        ua: '',
      },
      uri: '/api/search/voice/get',
    })
  })

  test('should preserve song_url ordering and playlist_detail request shape', async () => {
    const requestSpy = createRequestSpy((uri) => {
      if (uri === '/api/song/enhance/player/url') {
        return {
          body: {
            code: 200,
            data: [
              { id: 2, url: 'second' },
              { id: 1, url: 'first' },
            ],
          },
          cookie: [],
          status: 200,
        }
      }

      return {
        body: {
          code: 200,
          playlist: {
            id: 123,
            trackCount: 2,
          },
        },
        cookie: [],
        status: 200,
      }
    })

    const songUrl = await invokeRealModule(
      'song_url',
      {
        id: '1,2',
        br: '320000',
      },
      requestSpy.requestHandler,
    )
    const playlistDetail = await invokeRealModule(
      'playlist_detail',
      {
        id: '123',
      },
      requestSpy.requestHandler,
    )

    expect(requestSpy.calls[0]).toEqual({
      data: {
        br: 320000,
        ids: '["1","2"]',
      },
      options: {
        checkToken: false,
        cookie: undefined,
        crypto: '',
        domain: '',
        e_r: undefined,
        proxy: undefined,
        realIP: undefined,
        ua: '',
      },
      uri: '/api/song/enhance/player/url',
    })
    expect(requestSpy.calls[1]).toEqual({
      data: {
        id: '123',
        n: 100000,
        s: 8,
      },
      options: {
        checkToken: false,
        cookie: undefined,
        crypto: '',
        domain: '',
        e_r: undefined,
        proxy: undefined,
        realIP: undefined,
        ua: '',
      },
      uri: '/api/v6/playlist/detail',
    })
    expect(readArrayProperty(songUrl.body, 'data')).toEqual([
      { id: 1, url: 'first' },
      { id: 2, url: 'second' },
    ])
    expect(readRecordProperty(playlistDetail.body, 'playlist')).toEqual({
      id: 123,
      trackCount: 2,
    })
  })

  test('should keep user_account on weapi and retain cookie semantics', async () => {
    const requestSpy = createRequestSpy(() => {
      return {
        body: {
          code: 200,
          profile: {
            userId: 1,
          },
        },
        cookie: ['MUSIC_U=upstream-account; Path=/'],
        status: 200,
      }
    })

    const response = await invokeRealModule(
      'user_account',
      {
        cookie: 'MUSIC_U=phase5-cookie',
      },
      requestSpy.requestHandler,
    )

    expect(requestSpy.calls).toEqual([
      {
        data: {},
        options: {
          checkToken: false,
          cookie: {
            MUSIC_U: 'phase5-cookie',
          },
          crypto: 'weapi',
          domain: '',
          e_r: undefined,
          proxy: undefined,
          realIP: undefined,
          ua: '',
        },
        uri: '/api/nuser/account/get',
      },
    ])
    expect(response.cookie).toEqual(['MUSIC_U=upstream-account; Path=/'])
    expect(readRecordProperty(response.body, 'profile')).toEqual({
      userId: 1,
    })
  })

  test('should preserve login_cellphone request body and success normalization', async () => {
    const requestSpy = createRequestSpy(() => {
      return {
        body: {
          avatarImgId_str: 'avatar-id',
          code: 200,
          profile: {
            nickname: 'hana',
          },
        },
        cookie: ['MUSIC_U=login-cookie; Path=/', '__csrf=token; Path=/'],
        status: 200,
      }
    })

    const response = await invokeRealModule(
      'login_cellphone',
      {
        password: 'secret',
        phone: '13800138000',
      },
      requestSpy.requestHandler,
    )

    expect(requestSpy.calls).toEqual([
      {
        data: {
          captcha: undefined,
          countrycode: '86',
          https: 'true',
          password: '5ebe2294ecd0e0f08eab7690d2a6ee69',
          phone: '13800138000',
          remember: 'true',
          type: '1',
        },
        options: {
          checkToken: false,
          cookie: undefined,
          crypto: 'weapi',
          domain: '',
          e_r: undefined,
          proxy: undefined,
          realIP: undefined,
          ua: '',
        },
        uri: '/api/w/login/cellphone',
      },
    ])
    expect(readStringProperty(response.body, 'avatarImgIdStr')).toBe('avatar-id')
    expect(readStringProperty(response.body, 'cookie')).toBe(
      'MUSIC_U=login-cookie; Path=/;__csrf=token; Path=/',
    )
  })

  test('should keep login_qr_create local qr generation behavior', async () => {
    const response = await invokeRealModule('login_qr_create', {
      cookie: 'sDeviceId=device-phase5',
      key: 'qr-key',
      platform: 'web',
      qrimg: true,
    })

    const bodyData = readRecordProperty(response.body, 'data')
    const qrurl = readStringProperty(bodyData, 'qrurl')
    const qrimg = readStringProperty(bodyData, 'qrimg')

    expect(qrurl).toMatch(
      /^https:\/\/music\.163\.com\/login\?codekey=qr-key&chainId=v1_device-phase5_web_login_\d+$/,
    )
    expect(qrimg.startsWith('data:image/png;base64,')).toBe(true)
  })

  test('should keep batch filtering only legacy /api-prefixed subrequests', async () => {
    const requestSpy = createRequestSpy(() => {
      return {
        body: {
          code: 200,
        },
        cookie: [],
        status: 200,
      }
    })

    await invokeRealModule(
      'batch',
      {
        '/api/song/detail': {
          c: '[{"id":"1"}]',
        },
        '/api/user/account': {},
        shouldIgnore: true,
      },
      requestSpy.requestHandler,
    )

    expect(requestSpy.calls).toEqual([
      {
        data: {
          '/api/song/detail': {
            c: '[{"id":"1"}]',
          },
          '/api/user/account': {},
        },
        options: {
          checkToken: false,
          cookie: undefined,
          crypto: '',
          domain: '',
          e_r: undefined,
          proxy: undefined,
          realIP: undefined,
          ua: '',
        },
        uri: '/api/batch',
      },
    ])
  })

  test('should keep daily_signin and personal_fm request contracts', async () => {
    const requestSpy = createRequestSpy((uri) => {
      if (uri === '/api/point/dailyTask') {
        return Promise.reject({
          body: {
            code: 301,
          },
          cookie: [],
          status: 301,
        })
      }

      return {
        body: {
          code: 200,
          data: [],
        },
        cookie: [],
        status: 200,
      }
    })

    try {
      await invokeRealModule(
        'daily_signin',
        {
          cookie: 'MUSIC_U=signed-in',
          type: 1,
        },
        requestSpy.requestHandler,
      )
      throw new TypeError('Expected daily_signin to preserve the legacy 301 response')
    } catch (error) {
      expect(error).toEqual({
        body: {
          code: 301,
        },
        cookie: [],
        status: 301,
      })
    }

    const personalFm = await invokeRealModule(
      'personal_fm',
      {
        cookie: 'MUSIC_U=fm-cookie',
      },
      requestSpy.requestHandler,
    )

    expect(requestSpy.calls).toEqual([
      {
        data: {
          type: 1,
        },
        options: {
          checkToken: false,
          cookie: {
            MUSIC_U: 'signed-in',
          },
          crypto: '',
          domain: '',
          e_r: undefined,
          proxy: undefined,
          realIP: undefined,
          ua: '',
        },
        uri: '/api/point/dailyTask',
      },
      {
        data: {},
        options: {
          checkToken: false,
          cookie: {
            MUSIC_U: 'fm-cookie',
          },
          crypto: 'weapi',
          domain: '',
          e_r: undefined,
          proxy: undefined,
          realIP: undefined,
          ua: '',
        },
        uri: '/api/v1/radio/get',
      },
    ])
    expect(personalFm.status).toBe(200)
    expect(readArrayProperty(personalFm.body, 'data')).toEqual([])
  })

  test('should keep voice_upload missing-file validation on the legacy error contract', async () => {
    try {
      await invokeRealModule('voice_upload', {})
      throw new TypeError('Expected voice_upload to reject when songFile is missing')
    } catch (error) {
      expect(error).toEqual({
        body: {
          code: 500,
          msg: '请上传音频文件',
        },
        cookie: [],
        status: 500,
      })
    }
  })
})

interface CapturedRequest {
  readonly data: Record<string, unknown>
  readonly options: CreateRequestOptions
  readonly uri: string
}

function createRequestSpy(
  responder: (
    uri: string,
    data: Record<string, unknown>,
    options: CreateRequestOptions,
  ) => PromiseLikeReturn | Promise<PromiseLikeReturn>,
): {
  readonly calls: CapturedRequest[]
  readonly requestHandler: ModuleRequest
} {
  const calls: CapturedRequest[] = []
  const requestHandler = (async (uri, data, options = {}) => {
    calls.push({
      data,
      options,
      uri,
    })

    return responder(uri, data, options)
  }) as ModuleRequest

  return {
    calls,
    requestHandler,
  }
}

async function invokeRealModule(
  identifier: string,
  query: Record<string, unknown>,
  requestHandler?: ModuleRequest,
) {
  const moduleDefinitions = await realModuleDefinitionsPromise

  return invokeModule(identifier, query, {
    moduleDefinitions,
    requestHandler,
  })
}

type PromiseLikeReturn = {
  readonly body: Record<string, unknown>
  readonly cookie: string[]
  readonly status: number
}

function readArrayProperty(value: unknown, key: string): unknown[] {
  if (!isRecordLike(value) || !Array.isArray(value[key])) {
    throw new TypeError('Expected response body to contain an array data field')
  }

  return value[key]
}

function readRecordProperty(value: unknown, key: string): Record<string, unknown> {
  if (!isRecordLike(value) || !isRecordLike(value[key])) {
    throw new TypeError(`Expected "${key}" to be an object property`)
  }

  return value[key]
}

function readStringProperty(value: unknown, key: string): string {
  if (!isRecordLike(value) || typeof value[key] !== 'string') {
    throw new TypeError(`Expected "${key}" to be a string property`)
  }

  return value[key]
}

function isRecordLike(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}
