import type { GenerateConfigOptions, StartedServer, StartServerOptions } from '../types/index.ts'

import { readAnonymousToken, setRuntimeState } from '../core/runtime.ts'
import { createServer } from '../server/create-server.ts'
import { generateConfig } from './generate-config.ts'

const DEFAULT_PORT = 3021
const DEFAULT_HOSTNAME = '0.0.0.0'

function parsePort(value: string | undefined, fallback: number): number {
  if (!value) {
    return fallback
  }

  const parsed = Number.parseInt(value, 10)

  return Number.isNaN(parsed) ? fallback : parsed
}

function resolveStartServerOptions(
  options: StartServerOptions = {},
): Required<Pick<StartServerOptions, 'hostname' | 'port' | 'silent'>> & StartServerOptions {
  return {
    ...options,
    hostname: options.hostname ?? Bun.env.HOST ?? DEFAULT_HOSTNAME,
    port: options.port ?? parsePort(Bun.env.PORT, DEFAULT_PORT),
    silent: options.silent ?? false,
  }
}

/**
 * 启动 Bun HTTP 服务。
 */
export async function startServer(options: StartServerOptions = {}): Promise<StartedServer> {
  const resolvedOptions = resolveStartServerOptions(options)
  const app = await createServer(resolvedOptions)
  const server = Bun.serve({
    fetch: app.fetch,
    hostname: resolvedOptions.hostname,
    port: resolvedOptions.port,
  })
  const exposedHostname =
    resolvedOptions.hostname === '0.0.0.0' ? '127.0.0.1' : resolvedOptions.hostname
  const url = new URL(`http://${exposedHostname}:${resolvedOptions.port}`)

  if (!resolvedOptions.silent) {
    console.log(`[hana-music-api] listening on ${url.toString()}`)
  }

  return {
    app,
    server,
    url,
  }
}

export async function ensureAnonymousToken(options: GenerateConfigOptions = {}): Promise<string> {
  const token = readAnonymousToken(options.tokenFilePath)
  if (token) {
    setRuntimeState({
      anonymousToken: token,
    })

    return token
  }

  return generateConfig(options)
}

if (import.meta.main) {
  await ensureAnonymousToken()
  await startServer()
}
