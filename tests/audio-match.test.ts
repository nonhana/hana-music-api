import { afterEach, beforeEach, describe, expect, test } from 'bun:test'

import type { ModuleRequest } from '../src/types/index.ts'

import audioMatch from '../src/modules/audio_match.ts'

describe('audio match module', () => {
  const originalFetch = globalThis.fetch

  beforeEach(() => {
    globalThis.fetch = createFetchMock(originalFetch)
  })

  afterEach(() => {
    globalThis.fetch = originalFetch
  })

  test('should preserve upstream match payload at top-level data', async () => {
    const response = await audioMatch(
      {
        audioFP: 'fingerprint-value',
        duration: 3,
      },
      (async () => {
        throw new Error('audio_match should not use ModuleRequest for upstream fetch')
      }) as ModuleRequest,
    )

    expect(response.status).toBe(200)
    expect(response.body).toEqual({
      code: 200,
      data: {
        noMatchReason: 10,
        queryId: 'query-1',
        result: [
          {
            song: {
              album: {
                name: 'Album',
              },
              id: 123,
              name: 'Song',
            },
            startTime: 1500,
          },
        ],
        type: 0,
      },
      message: '',
    })
  })
})

function createFetchMock(originalFetch: typeof fetch): typeof fetch {
  const mockFetch = async (_input: string | Request | URL, _init?: RequestInit) =>
    new Response(
      JSON.stringify({
        code: 200,
        data: {
          noMatchReason: 10,
          queryId: 'query-1',
          result: [
            {
              song: {
                album: {
                  name: 'Album',
                },
                id: 123,
                name: 'Song',
              },
              startTime: 1500,
            },
          ],
          type: 0,
        },
        message: '',
      }),
      {
        headers: {
          'Content-Type': 'application/json',
        },
        status: 200,
      },
    )

  return Object.assign(mockFetch, {
    preconnect: originalFetch.preconnect.bind(originalFetch),
  }) as typeof fetch
}
