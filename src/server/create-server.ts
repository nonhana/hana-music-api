import { Hono } from 'hono'

import type { CreateServerOptions } from '../types/index.ts'

import { registerBaseRoutes } from './routes.ts'

/**
 * 创建 Hono 服务实例。
 * Phase 0 先明确 HTTP 壳层入口，后续阶段再逐步接入请求适配、Cookie 和模块路由。
 */
export function createServer(options: CreateServerOptions = {}): Hono {
  const app = new Hono()

  registerBaseRoutes(app, options)

  return app
}
