import { describe, expect, test } from 'bun:test'

import type { FetchLike } from '../src/types/index.ts'

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
  const headers = init?.headers
  if (headers instanceof Headers) {
    return headers.get('Cookie') ?? ''
  }

  if (headers && !Array.isArray(headers)) {
    const cookie = headers.Cookie
    return typeof cookie === 'string' ? cookie : ''
  }

  return ''
}
