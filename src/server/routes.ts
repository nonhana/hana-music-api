import type { Hono } from 'hono'

import type { CreateServerOptions } from '../types/index.ts'

const DEFAULT_SERVICE_NAME = 'hana-music-api'
const DEFAULT_SERVICE_VERSION = 'phase-0'

/**
 * 注册 Phase 0 的基础路由。
 * 这里只保留最小可运行能力，后续再承接旧项目的动态模块分发。
 */
export function registerBaseRoutes(app: Hono, options: CreateServerOptions = {}): void {
  const serviceName = options.serviceName ?? DEFAULT_SERVICE_NAME
  const serviceVersion = options.serviceVersion ?? DEFAULT_SERVICE_VERSION

  app.get('/', (context) => {
    return context.json({
      name: serviceName,
      phase: 0,
      ready: true,
      message: 'hana-music-api migration baseline is ready',
    })
  })

  app.get('/health', (context) => {
    return context.json({
      ok: true,
      name: serviceName,
      version: serviceVersion,
    })
  })
}
