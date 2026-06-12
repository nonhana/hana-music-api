import { describe, expect, test } from 'bun:test'

import type { FetchLike } from '../src/types/index.ts'

import { ensureRuntimeAnonymousToken } from '../src/core/anonymous.ts'
import { getRuntimeState, setRuntimeState } from '../src/core/runtime.ts'

function anonymousFetcher(token: string): { calls: () => number; fetcher: FetchLike } {
  let calls = 0
  const fetcher: FetchLike = async () => {
    calls += 1

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

  return {
    calls: () => calls,
    fetcher,
  }
}

describe('ensureRuntimeAnonymousToken', () => {
  test('should register and cache an anonymous token when runtime has none', async () => {
    setRuntimeState({
      anonymousToken: '',
    })
    const { calls, fetcher } = anonymousFetcher('lazy-token')

    const token = await ensureRuntimeAnonymousToken({
      fetcher,
    })

    expect(token).toBe('lazy-token')
    expect(getRuntimeState().anonymousToken).toBe('lazy-token')
    expect(calls()).toBe(1)
  })

  test('should reuse the cached token without re-registering', async () => {
    setRuntimeState({
      anonymousToken: 'existing-token',
    })
    const { calls, fetcher } = anonymousFetcher('should-not-be-used')

    const token = await ensureRuntimeAnonymousToken({
      fetcher,
    })

    expect(token).toBe('existing-token')
    expect(calls()).toBe(0)
  })

  test('should single-flight concurrent callers', async () => {
    setRuntimeState({
      anonymousToken: '',
    })
    const { calls, fetcher } = anonymousFetcher('shared-token')

    const [a, b] = await Promise.all([
      ensureRuntimeAnonymousToken({ fetcher }),
      ensureRuntimeAnonymousToken({ fetcher }),
    ])

    expect(a).toBe('shared-token')
    expect(b).toBe('shared-token')
    expect(calls()).toBe(1)
  })
})
