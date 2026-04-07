import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import type { CreateServerOptions } from '../types/index.ts'

import { MemoryResponseCache } from '../core/cache.ts'
import { registerDemoRoutes } from './demo-routes.tsx'
import { registerDocsRoutes } from './docs-routes.ts'
import { loadModuleDefinitions } from './module-loader.ts'
import { createDefaultRequestHandler, registerBaseRoutes, registerModuleRoutes } from './routes.ts'

/**
 * 创建 Hono 服务实例。
 * Phase 2 开始，这里负责把 Hono 服务壳层和模块分发真正接起来。
 */
export async function createServer(options: CreateServerOptions = {}): Promise<Hono> {
  const app = new Hono()
  const modulesDirectory =
    options.modulesDirectory ?? resolve(dirname(fileURLToPath(import.meta.url)), '../modules')
  const moduleDefinitions =
    options.moduleDefinitions ?? (await loadModuleDefinitions(modulesDirectory))
  const cache =
    options.cacheEnabled === false ? null : new MemoryResponseCache(options.cacheTtlMs ?? 120_000)

  app.use('*', createCorsMiddleware(options))

  registerBaseRoutes(app, options)
  registerDocsRoutes(app, {
    docsDistDirectory: options.docsDistDirectory,
    serviceName: options.serviceName ?? 'hana-music-api',
  })
  registerModuleRoutes(app, moduleDefinitions, {
    cache,
    requestHandler: options.requestHandler ?? createDefaultRequestHandler(),
  })
  registerDemoRoutes(app)

  return app
}

function createCorsMiddleware(options: CreateServerOptions) {
  return cors({
    allowHeaders: ['X-Requested-With', 'Content-Type'],
    allowMethods: ['PUT', 'POST', 'GET', 'DELETE', 'OPTIONS'],
    credentials: true,
    origin: (origin) => {
      return options.corsAllowOrigin ?? origin ?? '*'
    },
  })
}
