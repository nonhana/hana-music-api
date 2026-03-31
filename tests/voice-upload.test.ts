import { afterEach, beforeEach, describe, expect, test } from 'bun:test'

import type { ModuleRequest } from '../src/types/index.ts'

import {
  createMultipartCompleteXml,
  parseMultipartUploadId,
} from '../src/modules/_voice-upload-xml.ts'
import voiceUpload from '../src/modules/voice_upload.ts'

describe('voice upload xml helpers', () => {
  test('should parse upload id from initiate xml', () => {
    expect(
      parseMultipartUploadId(
        '<InitiateMultipartUploadResult><UploadId>upload-123</UploadId></InitiateMultipartUploadResult>',
      ),
    ).toBe('upload-123')
  })

  test('should reject malformed initiate xml', () => {
    expect(() => {
      parseMultipartUploadId('<InitiateMultipartUploadResult />')
    }).toThrow('Missing UploadId')
  })

  test('should serialize complete multipart xml in part order', () => {
    expect(createMultipartCompleteXml(['etag-1', 'etag-2'])).toBe(
      '<CompleteMultipartUpload><Part><PartNumber>1</PartNumber><ETag>etag-1</ETag></Part><Part><PartNumber>2</PartNumber><ETag>etag-2</ETag></Part></CompleteMultipartUpload>',
    )
  })
})

describe('voice upload module', () => {
  const originalFetch = globalThis.fetch

  beforeEach(() => {
    globalThis.fetch = createFetchMock(originalFetch)
  })

  afterEach(() => {
    globalThis.fetch = originalFetch
  })

  test('should complete multipart upload and forward voice metadata', async () => {
    const requestCalls: Array<{ data: Record<string, unknown>; uri: string }> = []
    const response = await voiceUpload(
      {
        autoPublish: 1,
        composedSongs: '1,2',
        description: 'voice-desc',
        privacy: 0,
        songFile: {
          data: new Uint8Array(10 * 1024 * 1024 + 1),
          mimetype: 'audio/mpeg',
          name: 'demo.mp3',
          size: 10 * 1024 * 1024 + 1,
        },
        songName: 'demo-track',
      },
      (async (uri, data) => {
        requestCalls.push({ data, uri })

        if (uri === '/api/nos/token/alloc') {
          return {
            body: {
              result: {
                docId: 'doc-1',
                objectKey: '/voice/demo',
                token: 'nos-token',
              },
            },
            cookie: [],
            status: 200,
          }
        }

        if (uri === '/api/voice/workbench/voice/batch/upload/preCheck') {
          return {
            body: {
              code: 200,
            },
            cookie: [],
            status: 200,
          }
        }

        if (uri === '/api/voice/workbench/voice/batch/upload/v2') {
          return {
            body: {
              data: {
                voiceId: 'voice-1',
              },
            },
            cookie: [],
            status: 200,
          }
        }

        throw new TypeError(`Unexpected request uri: ${uri}`)
      }) as ModuleRequest,
    )

    expect(response.status).toBe(200)
    expect(response.body).toEqual({
      code: 200,
      data: {
        voiceId: 'voice-1',
      },
    })

    expect(requestCalls.map((entry) => entry.uri)).toEqual([
      '/api/nos/token/alloc',
      '/api/voice/workbench/voice/batch/upload/preCheck',
      '/api/voice/workbench/voice/batch/upload/v2',
    ])

    const preCheckPayload = requestCalls[1]?.data.voiceData
    expect(typeof preCheckPayload).toBe('string')
    expect(preCheckPayload).toContain('"name":"demo-track"')
    expect(preCheckPayload).toContain('"dfsId":"doc-1"')
    expect(preCheckPayload).toContain('"composedSongs":["1","2"]')
  })
})

function createFetchMock(originalFetch: typeof fetch): typeof fetch {
  const completeBodies: string[] = []

  const mockFetch = async (input: string | Request | URL, init?: RequestInit) => {
    const url = String(input)

    if (url.endsWith('?uploads')) {
      return new Response(
        '<InitiateMultipartUploadResult><UploadId>upload-123</UploadId></InitiateMultipartUploadResult>',
        {
          status: 200,
        },
      )
    }

    if (url.includes('partNumber=1')) {
      return new Response(null, {
        headers: {
          etag: 'etag-1',
        },
        status: 200,
      })
    }

    if (url.includes('partNumber=2')) {
      return new Response(null, {
        headers: {
          etag: 'etag-2',
        },
        status: 200,
      })
    }

    if (url.includes('uploadId=upload-123')) {
      completeBodies.push(String(init?.body ?? ''))
      expect(completeBodies[0]).toBe(
        '<CompleteMultipartUpload><Part><PartNumber>1</PartNumber><ETag>etag-1</ETag></Part><Part><PartNumber>2</PartNumber><ETag>etag-2</ETag></Part></CompleteMultipartUpload>',
      )

      return new Response(null, {
        status: 200,
      })
    }

    throw new TypeError(`Unexpected fetch url: ${url}`)
  }

  return Object.assign(mockFetch, {
    preconnect: originalFetch.preconnect.bind(originalFetch),
  }) as typeof fetch
}
