import type { Server } from 'bun'
import type { Hono } from 'hono'

/**
 * `createServer()` 的最小公共配置。
 * Phase 0 只定义稳定边界，业务细节留到后续阶段补齐。
 */
export interface CreateServerOptions {
  readonly serviceName?: string
  readonly serviceVersion?: string
}

/**
 * `startServer()` 的启动参数。
 */
export interface StartServerOptions extends CreateServerOptions {
  readonly port?: number
  readonly hostname?: string
  readonly silent?: boolean
}

/**
 * 服务启动后的返回结果，供程序化调用使用。
 */
export interface StartedServer {
  readonly app: Hono
  readonly server: Server<unknown>
  readonly url: URL
}
