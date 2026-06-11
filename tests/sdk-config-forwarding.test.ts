import { describe, expect, test } from 'bun:test'

import type { FetchLike, RequestDebugEvent } from '../src/types/index.ts'

import { createHanaMusicApi, lyric } from '../index.ts'

describe('sdk config forwarding', () => {
  test('should forward base config to migrated modules created by createHanaMusicApi', async () => {
    const captured: {
      init?: RequestInit
      input?: Parameters<FetchLike>[0]
    } = {}
    const events: RequestDebugEvent[] = []
    const fetcher: FetchLike = async (input, init) => {
      captured.input = input
      captured.init = init

      return new Response(JSON.stringify({ code: 200, lrc: { lyric: 'demo' } }), {
        status: 200,
      })
    }

    const hana = createHanaMusicApi({
      connectionStrategy: 'close',
      cookie: 'MUSIC_U=linked-cookie',
      fetcher,
      headers: {
        'X-Debug-Mode': 'linked',
      },
      ip: '1.2.3.4',
      onRequestEvent: (event) => events.push(event),
      state: {
        anonymousToken: 'anonymous-token',
        deviceId: 'DEVICE_ID',
      },
      timeoutMs: 1_000,
    })

    await hana.lyric({
      id: '36621797',
    })

    expect(getRequestUrl(captured.input)).toBe('https://interface.music.163.com/eapi/song/lyric')
    expect(getHeader(captured.init, 'X-Debug-Mode')).toBe('linked')
    expect(getHeader(captured.init, 'X-Real-IP')).toBe('1.2.3.4')
    expect(getHeader(captured.init, 'Connection')).toBe('close')
    expect(captured.init?.signal).toBeInstanceOf(AbortSignal)
    expect(events.some((event) => event.type === 'attempt')).toBe(true)
    expect(decodeURIComponent(getHeader(captured.init, 'Cookie'))).toContain('deviceId=DEVICE_ID')
  })

  test('should forward per-call config to migrated raw module functions', async () => {
    const captured: {
      init?: RequestInit
      input?: Parameters<FetchLike>[0]
    } = {}
    const fetcher: FetchLike = async (input, init) => {
      captured.input = input
      captured.init = init

      return new Response(JSON.stringify({ code: 200, lrc: { lyric: 'demo' } }), {
        status: 200,
      })
    }

    await lyric(
      {
        id: '36621797',
      },
      {
        connectionStrategy: 'close',
        cookie: 'MUSIC_U=raw-cookie',
        fetcher,
        headers: {
          'X-Debug-Mode': 'raw',
        },
        ip: '5.6.7.8',
        state: {
          anonymousToken: 'anonymous-token',
          deviceId: 'RAW_DEVICE',
        },
        timeoutMs: 1_000,
      },
    )

    expect(getRequestUrl(captured.input)).toBe('https://interface.music.163.com/eapi/song/lyric')
    expect(getHeader(captured.init, 'X-Debug-Mode')).toBe('raw')
    expect(getHeader(captured.init, 'X-Real-IP')).toBe('5.6.7.8')
    expect(getHeader(captured.init, 'Connection')).toBe('close')
    expect(captured.init?.signal).toBeInstanceOf(AbortSignal)
    expect(decodeURIComponent(getHeader(captured.init, 'Cookie'))).toContain('deviceId=RAW_DEVICE')
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
