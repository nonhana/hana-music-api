import { describe, expect, test } from 'bun:test'

import type { FetchLike } from '../src/types/index.ts'

import { createHanaMusicApi } from '../index.ts'
import { cookieToJson } from '../src/core/utils.ts'

function countingLyricFetcher(): { calls: () => number; fetcher: FetchLike } {
  let calls = 0
  const fetcher: FetchLike = async () => {
    calls += 1

    return new Response(JSON.stringify({ code: 200, lrc: { lyric: 'demo' } }), {
      status: 200,
    })
  }

  return {
    calls: () => calls,
    fetcher,
  }
}

describe('sdk response cache', () => {
  test('should serve identical calls from cache within ttl', async () => {
    const { calls, fetcher } = countingLyricFetcher()
    const hana = createHanaMusicApi({
      cache: {
        ttlMs: 60_000,
      },
      cookie: 'MUSIC_U=cached-user',
      fetcher,
    })

    await hana.lyric({ id: '1' })
    await hana.lyric({ id: '1' })

    expect(calls()).toBe(1)
  })

  test('should not cache across different queries', async () => {
    const { calls, fetcher } = countingLyricFetcher()
    const hana = createHanaMusicApi({
      cache: {
        ttlMs: 60_000,
      },
      cookie: 'MUSIC_U=cached-user',
      fetcher,
    })

    await hana.lyric({ id: '1' })
    await hana.lyric({ id: '2' })

    expect(calls()).toBe(2)
  })

  test('should single-flight concurrent identical calls', async () => {
    const { calls, fetcher } = countingLyricFetcher()
    const hana = createHanaMusicApi({
      cache: {
        ttlMs: 60_000,
      },
      cookie: 'MUSIC_U=cached-user',
      fetcher,
    })

    await Promise.all([hana.lyric({ id: '1' }), hana.lyric({ id: '1' })])

    expect(calls()).toBe(1)
  })
})

describe('sdk identity pool', () => {
  test('should rotate registered anonymous identities across calls', async () => {
    const registered: string[] = []
    const sentTokens: string[] = []
    const fetcher: FetchLike = async (input, init) => {
      const cookieHeader =
        init?.headers instanceof Headers
          ? (init.headers.get('Cookie') ?? '')
          : ((init?.headers as Record<string, string> | undefined)?.Cookie ?? '')
      const parsed = cookieToJson(decodeURIComponent(cookieHeader))
      const url = typeof input === 'string' ? input : String(input)

      if (url.includes('register/anonimous')) {
        const token = `pool-token-${registered.length + 1}`
        registered.push(token)

        const response = new Response(JSON.stringify({ code: 200 }), {
          status: 200,
        })
        ;(
          response.headers as Headers & {
            getSetCookie?: () => string[]
          }
        ).getSetCookie = () => [`MUSIC_A=${token}; Path=/`]

        return response
      }

      if (parsed.MUSIC_A) {
        sentTokens.push(String(parsed.MUSIC_A))
      }

      return new Response(JSON.stringify({ code: 200, lrc: { lyric: 'demo' } }), {
        status: 200,
      })
    }

    const hana = createHanaMusicApi({
      fetcher,
      identityPool: {
        size: 2,
      },
    })

    await hana.lyric({ id: '1' })
    await hana.lyric({ id: '2' })
    await hana.lyric({ id: '3' })

    expect(registered.length).toBe(2)
    expect(sentTokens).toEqual([registered[0]!, registered[1]!, registered[0]!])
  })
})
