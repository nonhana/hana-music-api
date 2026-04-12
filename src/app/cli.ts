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

function resolveAnonymousTokenFilePath(options: GenerateConfigOptions): string | undefined {
  return options.tokenFilePath ?? Bun.env.ANONYMOUS_TOKEN_FILE
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
    console.info(`[hana-music-api] listening on ${url.toString()}`)
  }

  return {
    app,
    server,
    url,
  }
}

export async function ensureAnonymousToken(options: GenerateConfigOptions = {}): Promise<string> {
  const tokenFilePath = resolveAnonymousTokenFilePath(options)
  const token = readAnonymousToken(tokenFilePath)
  if (token) {
    setRuntimeState({
      anonymousToken: token,
    })

    return token
  }

  return generateConfig({
    ...options,
    tokenFilePath,
  })
}

if (import.meta.main) {
  await ensureAnonymousToken()
  const startedServer = await startServer()
  let isStopping = false
  const stopServerAndExit = async () => {
    if (isStopping) {
      return
    }

    isStopping = true
    try {
      await startedServer.server.stop()
    } finally {
      process.exit(0)
    }
  }

  process.once('SIGINT', () => {
    void stopServerAndExit()
  })
  process.once('SIGTERM', () => {
    void stopServerAndExit()
  })
}
