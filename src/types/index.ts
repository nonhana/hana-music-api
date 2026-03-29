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

export type RequestCrypto = '' | 'api' | 'eapi' | 'linuxapi' | 'weapi'

export type BooleanLike = boolean | number | string

export type CookieValue = boolean | number | string

export type CookieRecord = Record<string, CookieValue | undefined>

export type FetchLike = (input: Request | URL | string, init?: RequestInit) => Promise<Response>

export interface RuntimeState {
  readonly anonymousToken: string
  readonly cnIp: string
  readonly deviceId: string
}

export interface CreateRequestOptions {
  readonly checkToken?: BooleanLike
  readonly cookie?: CookieRecord | string
  readonly crypto?: RequestCrypto
  readonly domain?: string
  readonly e_r?: BooleanLike
  readonly fetcher?: FetchLike
  readonly headers?: Record<string, string>
  readonly ip?: string
  readonly proxy?: string
  readonly realIP?: string
  readonly state?: Partial<RuntimeState>
  readonly ua?: string
}

export interface NcmApiResponse<TBody = unknown> {
  body: TBody
  cookie: string[]
  status: number
}

export interface GenerateConfigOptions {
  readonly fetcher?: FetchLike
  readonly state?: Partial<RuntimeState>
  readonly tokenFilePath?: string
}
