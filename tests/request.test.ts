import { describe, expect, test } from 'bun:test'
import { createCipheriv } from 'node:crypto'
import { gzipSync } from 'node:zlib'

import type { FetchLike, RequestDebugEvent } from '../src/types/index.ts'

import { aesEncrypt } from '../src/core/crypto.ts'
import { createRequest } from '../src/core/request.ts'

const specialCodeFetcher: FetchLike = async () => {
  return new Response(JSON.stringify({ code: 400, msg: 'bad request' }), {
    status: 200,
  })
}

describe('createRequest', () => {
  test('should build an api request with default cookie state', async () => {
    let input: Parameters<FetchLike>[0] | undefined
    let init: RequestInit | undefined
    const fetcher: FetchLike = async (requestInput, requestInit) => {
      input = requestInput
      init = requestInit

      const response = new Response(JSON.stringify({ code: 200, ok: true }), {
        status: 200,
      })
      ;(
        response.headers as Headers & {
          getSetCookie?: () => string[]
        }
      ).getSetCookie = () => ['MUSIC_U=user-token; Domain=.music.163.com; Path=/']

      return response
    }
    const response = await createRequest(
      '/api/test',
      {
        id: 123,
      },
      {
        cookie: {},
        crypto: 'api',
        fetcher,
        state: {
          anonymousToken: 'anonymous-token',
          deviceId: 'DEVICE_ID',
        },
      },
    )

    expect(getRequestUrl(input)).toBe('https://interface.music.163.com/api/test')
    expect(init?.method).toBe('POST')
    expect(getBodyText(init)).toContain('id=123')
    expect(getCookieHeader(init)).toContain('MUSIC_A=anonymous-token')
    expect(response.cookie).toEqual(['MUSIC_U=user-token; Path=/'])
    expect(response.status).toBe(200)
  })

  test('should build a weapi request payload', async () => {
    let input: Parameters<FetchLike>[0] | undefined
    let init: RequestInit | undefined
    const fetcher: FetchLike = async (requestInput, requestInit) => {
      input = requestInput
      init = requestInit

      return new Response(JSON.stringify({ code: 200 }), {
        status: 200,
      })
    }

    await createRequest(
      '/api/register/anonimous',
      {
        username: 'demo',
      },
      {
        cookie: {},
        crypto: 'weapi',
        fetcher,
        state: {
          anonymousToken: 'anonymous-token',
          deviceId: 'DEVICE_ID',
        },
      },
    )

    expect(getRequestUrl(input)).toBe('https://music.163.com/weapi/register/anonimous')
    expect(getBodyText(init)).toContain('params=')
    expect(getBodyText(init)).toContain('encSecKey=')
  })

  test('should keep legacy special business codes as http 200', async () => {
    const response = await createRequest(
      '/api/test',
      {},
      {
        crypto: 'api',
        fetcher: specialCodeFetcher,
        state: {
          anonymousToken: 'anonymous-token',
          deviceId: 'DEVICE_ID',
        },
      },
    )

    expect(response.status).toBe(200)
  })

  test('should retry transient transport errors with a fresh connection path', async () => {
    const initList: RequestInit[] = []
    const events: RequestDebugEvent[] = []
    let calls = 0
    const fetcher: FetchLike = async (_requestInput, requestInit) => {
      calls += 1
      if (requestInit) {
        initList.push(requestInit)
      }

      if (calls === 1) {
        throw new Error('The socket connection was closed unexpectedly')
      }

      return new Response(JSON.stringify({ code: 200, ok: true }), {
        status: 200,
      })
    }

    const response = await createRequest(
      '/api/test',
      {},
      {
        crypto: 'api',
        fetcher,
        onRequestEvent: (event) => events.push(event),
        retry: {
          backoffMs: 0,
          jitter: false,
          retries: 1,
          retryNonIdempotent: true,
        },
        state: {
          anonymousToken: 'anonymous-token',
          deviceId: 'DEVICE_ID',
        },
      },
    )

    expect(response.status).toBe(200)
    expect(calls).toBe(2)
    expect(getHeader(initList[0], 'Connection')).toBe('')
    expect(getHeader(initList[1], 'Connection')).toBe('close')
    expect(events.some((event) => event.type === 'retry')).toBe(true)
  })

  test('should abort requests that exceed timeoutMs', async () => {
    let sawSignal = false
    const fetcher: FetchLike = async (_requestInput, requestInit) => {
      sawSignal = requestInit?.signal instanceof AbortSignal

      return new Promise<Response>((_resolve, reject) => {
        requestInit?.signal?.addEventListener(
          'abort',
          () => reject(new Error('aborted by request timeout')),
          { once: true },
        )
      })
    }

    await expect(
      createRequest(
        '/api/test',
        {},
        {
          crypto: 'api',
          fetcher,
          state: {
            anonymousToken: 'anonymous-token',
            deviceId: 'DEVICE_ID',
          },
          timeoutMs: 1,
        },
      ),
    ).rejects.toMatchObject({
      status: 504,
    })

    expect(sawSignal).toBe(true)
  })

  test('should force connection close when configured', async () => {
    let init: RequestInit | undefined
    const fetcher: FetchLike = async (_requestInput, requestInit) => {
      init = requestInit

      return new Response(JSON.stringify({ code: 200 }), {
        status: 200,
      })
    }

    await createRequest(
      '/api/test',
      {},
      {
        connectionStrategy: 'close',
        crypto: 'api',
        fetcher,
        state: {
          anonymousToken: 'anonymous-token',
          deviceId: 'DEVICE_ID',
        },
      },
    )

    expect(getHeader(init, 'Connection')).toBe('close')
  })

  test('should not retry post requests unless explicitly allowed', async () => {
    let calls = 0
    const fetcher: FetchLike = async () => {
      calls += 1
      throw new Error('The socket connection was closed unexpectedly')
    }

    await expect(
      createRequest(
        '/api/test',
        {},
        {
          crypto: 'api',
          fetcher,
          retry: {
            backoffMs: 0,
            jitter: false,
            retries: 2,
          },
          state: {
            anonymousToken: 'anonymous-token',
            deviceId: 'DEVICE_ID',
          },
        },
      ),
    ).rejects.toMatchObject({
      status: 502,
    })

    expect(calls).toBe(1)
  })

  test('should decrypt weapi encrypted responses when e_r is enabled', async () => {
    const EAPI_KEY = 'e82ckenh8dichen8'
    const encryptedHex = aesEncrypt(
      JSON.stringify({ code: 200, lrc: { lyric: 'demo' } }),
      'ecb',
      EAPI_KEY,
      '',
      'hex',
    )
    const fetcher: FetchLike = async () => {
      return new Response(Buffer.from(encryptedHex, 'hex'), {
        status: 200,
      })
    }

    const response = await createRequest(
      '/api/song/lyric',
      {},
      {
        crypto: 'weapi',
        e_r: true,
        fetcher,
        state: {
          anonymousToken: 'anonymous-token',
          deviceId: 'DEVICE_ID',
        },
      },
    )

    expect(response.status).toBe(200)
    expect(response.body).toMatchObject({
      code: 200,
      lrc: {
        lyric: 'demo',
      },
    })
  })

  test('should request gzipped eapi responses when acceptGzip is enabled', async () => {
    const EAPI_KEY = 'e82ckenh8dichen8'
    let sawHeader = ''
    const cipher = createCipheriv('aes-128-ecb', Buffer.from(EAPI_KEY, 'utf8'), null)
    cipher.setAutoPadding(true)
    const zippedHex = Buffer.concat([
      cipher.update(gzipSync(JSON.stringify({ code: 200, gz: true }))),
      cipher.final(),
    ])
      .toString('hex')
      .toUpperCase()
    const fetcher: FetchLike = async (_requestInput, requestInit) => {
      sawHeader = getHeader(requestInit, 'x-aeapi')

      return new Response(Buffer.from(zippedHex, 'hex'), {
        status: 200,
      })
    }

    const response = await createRequest(
      '/api/song/lyric',
      {},
      {
        acceptGzip: true,
        crypto: 'eapi',
        e_r: true,
        fetcher,
        state: {
          anonymousToken: 'anonymous-token',
          deviceId: 'DEVICE_ID',
        },
      },
    )

    expect(sawHeader).toBe('true')
    expect(response.body).toMatchObject({
      code: 200,
      gz: true,
    })
  })

  test('should fall back to runtime cnIp when no ip is provided', async () => {
    let init: RequestInit | undefined
    const fetcher: FetchLike = async (_requestInput, requestInit) => {
      init = requestInit

      return new Response(JSON.stringify({ code: 200 }), {
        status: 200,
      })
    }

    await createRequest(
      '/api/test',
      {},
      {
        crypto: 'api',
        fetcher,
        state: {
          anonymousToken: 'anonymous-token',
          cnIp: '116.25.123.45',
          deviceId: 'DEVICE_ID',
        },
      },
    )

    expect(getHeader(init, 'X-Real-IP')).toBe('116.25.123.45')
    expect(getHeader(init, 'X-Forwarded-For')).toBe('116.25.123.45')
  })

  test('should attach an abort signal using the default timeout', async () => {
    let sawSignal = false
    const fetcher: FetchLike = async (_requestInput, requestInit) => {
      sawSignal = requestInit?.signal instanceof AbortSignal

      return new Response(JSON.stringify({ code: 200 }), {
        status: 200,
      })
    }

    await createRequest(
      '/api/test',
      {},
      {
        crypto: 'api',
        fetcher,
        state: {
          anonymousToken: 'anonymous-token',
          deviceId: 'DEVICE_ID',
        },
      },
    )

    expect(sawSignal).toBe(true)
  })

  test('should allow disabling the timeout with timeoutMs 0', async () => {
    let sawSignal = true
    const fetcher: FetchLike = async (_requestInput, requestInit) => {
      sawSignal = requestInit?.signal instanceof AbortSignal

      return new Response(JSON.stringify({ code: 200 }), {
        status: 200,
      })
    }

    await createRequest(
      '/api/test',
      {},
      {
        crypto: 'api',
        fetcher,
        state: {
          anonymousToken: 'anonymous-token',
          deviceId: 'DEVICE_ID',
        },
        timeoutMs: 0,
      },
    )

    expect(sawSignal).toBe(false)
  })

  test.each([
    'getaddrinfo EAI_AGAIN music.163.com',
    'connect ECONNREFUSED 1.2.3.4:443',
    'connect ETIMEDOUT 1.2.3.4:443',
    'connect UND_ERR_CONNECT_TIMEOUT',
  ])('should retry connection-never-established error by default: %s', async (message) => {
    let calls = 0
    const fetcher: FetchLike = async () => {
      calls += 1
      if (calls === 1) {
        throw new Error(message)
      }

      return new Response(JSON.stringify({ code: 200, ok: true }), {
        status: 200,
      })
    }

    const response = await createRequest(
      '/api/test',
      {},
      {
        crypto: 'api',
        fetcher,
        retry: {
          backoffMs: 0,
          jitter: false,
        },
        state: {
          anonymousToken: 'anonymous-token',
          deviceId: 'DEVICE_ID',
        },
      },
    )

    expect(response.status).toBe(200)
    expect(calls).toBe(2)
  })
})

function getRequestUrl(input: Parameters<FetchLike>[0] | undefined): string {
  if (typeof input === 'string') {
    return input
  }

  if (input instanceof URL) {
    return input.toString()
  }

  return input?.url ?? ''
}

function getBodyText(init: RequestInit | undefined): string {
  return typeof init?.body === 'string' ? init.body : ''
}

function getCookieHeader(init: RequestInit | undefined): string {
  return getHeader(init, 'Cookie')
}

function getHeader(init: RequestInit | undefined, name: string): string {
  const headers = init?.headers
  if (headers instanceof Headers) {
    return headers.get(name) ?? ''
  }

  if (headers && !Array.isArray(headers)) {
    const value = headers[name as keyof typeof headers]
    return typeof value === 'string' ? value : ''
  }

  return ''
}
