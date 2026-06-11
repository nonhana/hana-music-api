import { describe, expect, test } from 'bun:test'

import type { FetchLike } from '../src/types/index.ts'

import { createHanaMusicApi } from '../index.ts'

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
