import { describe, expect, test } from 'bun:test'
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import type { FetchLike } from '../src/types/index.ts'

import { ensureAnonymousToken } from '../src/app/cli.ts'

function restoreAnonymousTokenFileEnv(previousValue: string | undefined): void {
  if (previousValue === undefined) {
    delete Bun.env.ANONYMOUS_TOKEN_FILE
    return
  }

  Bun.env.ANONYMOUS_TOKEN_FILE = previousValue
}

describe('ensureAnonymousToken', () => {
  test('should use Bun.env.ANONYMOUS_TOKEN_FILE when tokenFilePath is omitted', async () => {
    const temporaryDirectory = mkdtempSync(join(tmpdir(), 'hana-cli-token-'))
    const tokenFilePath = join(temporaryDirectory, 'anonymous_token')
    const previousAnonymousTokenFile = Bun.env.ANONYMOUS_TOKEN_FILE
    let fetchCount = 0
    const fetcher: FetchLike = async () => {
      fetchCount += 1

      const response = new Response(JSON.stringify({ code: 200 }), {
        status: 200,
      })
      ;(
        response.headers as Headers & {
          getSetCookie?: () => string[]
        }
      ).getSetCookie = () => ['MUSIC_A=generated-token; Path=/']

      return response
    }

    try {
      Bun.env.ANONYMOUS_TOKEN_FILE = tokenFilePath

      const token = await ensureAnonymousToken({
        fetcher,
        state: {
          cnIp: '1.1.1.1',
          deviceId: 'DEVICE_ID',
        },
      })

      expect(token).toBe('generated-token')
      expect(fetchCount).toBe(1)
      expect(readFileSync(tokenFilePath, 'utf8')).toBe('generated-token')
    } finally {
      restoreAnonymousTokenFileEnv(previousAnonymousTokenFile)
      rmSync(temporaryDirectory, {
        force: true,
        recursive: true,
      })
    }
  })

  test('should prefer explicit tokenFilePath over Bun.env.ANONYMOUS_TOKEN_FILE', async () => {
    const envTemporaryDirectory = mkdtempSync(join(tmpdir(), 'hana-cli-token-env-'))
    const explicitTemporaryDirectory = mkdtempSync(join(tmpdir(), 'hana-cli-token-explicit-'))
    const envTokenFilePath = join(envTemporaryDirectory, 'anonymous_token')
    const explicitTokenFilePath = join(explicitTemporaryDirectory, 'anonymous_token')
    const previousAnonymousTokenFile = Bun.env.ANONYMOUS_TOKEN_FILE
    writeFileSync(envTokenFilePath, 'env-token', 'utf8')
    let fetchCount = 0
    const fetcher: FetchLike = async () => {
      fetchCount += 1

      const response = new Response(JSON.stringify({ code: 200 }), {
        status: 200,
      })
      ;(
        response.headers as Headers & {
          getSetCookie?: () => string[]
        }
      ).getSetCookie = () => ['MUSIC_A=generated-token; Path=/']

      return response
    }

    try {
      Bun.env.ANONYMOUS_TOKEN_FILE = envTokenFilePath

      const token = await ensureAnonymousToken({
        fetcher,
        state: {
          cnIp: '1.1.1.1',
          deviceId: 'DEVICE_ID',
        },
        tokenFilePath: explicitTokenFilePath,
      })

      expect(token).toBe('generated-token')
      expect(fetchCount).toBe(1)
      expect(readFileSync(explicitTokenFilePath, 'utf8')).toBe('generated-token')
      expect(readFileSync(envTokenFilePath, 'utf8')).toBe('env-token')
    } finally {
      restoreAnonymousTokenFileEnv(previousAnonymousTokenFile)
      rmSync(envTemporaryDirectory, {
        force: true,
        recursive: true,
      })
      rmSync(explicitTemporaryDirectory, {
        force: true,
        recursive: true,
      })
    }
  })

  test('should generate and persist an anonymous token when the token file is missing', async () => {
    const temporaryDirectory = mkdtempSync(join(tmpdir(), 'hana-cli-token-'))
    const tokenFilePath = join(temporaryDirectory, 'anonymous_token')
    let fetchCount = 0
    const fetcher: FetchLike = async () => {
      fetchCount += 1

      const response = new Response(JSON.stringify({ code: 200 }), {
        status: 200,
      })
      ;(
        response.headers as Headers & {
          getSetCookie?: () => string[]
        }
      ).getSetCookie = () => ['MUSIC_A=generated-token; Path=/']

      return response
    }

    try {
      const token = await ensureAnonymousToken({
        fetcher,
        state: {
          cnIp: '1.1.1.1',
          deviceId: 'DEVICE_ID',
        },
        tokenFilePath,
      })

      expect(token).toBe('generated-token')
      expect(fetchCount).toBe(1)
      expect(readFileSync(tokenFilePath, 'utf8')).toBe('generated-token')
    } finally {
      rmSync(temporaryDirectory, {
        force: true,
        recursive: true,
      })
    }
  })

  test('should reuse an existing anonymous token without generating a new one', async () => {
    const temporaryDirectory = mkdtempSync(join(tmpdir(), 'hana-cli-token-'))
    const tokenFilePath = join(temporaryDirectory, 'anonymous_token')
    writeFileSync(tokenFilePath, 'existing-token', 'utf8')
    let fetchCount = 0
    const fetcher: FetchLike = async () => {
      fetchCount += 1

      return new Response(JSON.stringify({ code: 200 }), {
        status: 200,
      })
    }

    try {
      const token = await ensureAnonymousToken({
        fetcher,
        tokenFilePath,
      })

      expect(token).toBe('existing-token')
      expect(fetchCount).toBe(0)
    } finally {
      rmSync(temporaryDirectory, {
        force: true,
        recursive: true,
      })
    }
  })
})
