import type { Server } from 'bun'
import type { Hono } from 'hono'

export type RequestCrypto = '' | 'api' | 'eapi' | 'linuxapi' | 'weapi'

export type BooleanLike = boolean | number | string

export type CookieValue = boolean | number | string

export type CookieRecord = Record<string, CookieValue | undefined>

export type FetchLike = (input: Request | URL | string, init?: RequestInit) => Promise<Response>

export type ModuleQuery = Record<string, unknown>

export interface RuntimeState {
  readonly anonymousToken: string
  readonly cnIp: string
  readonly deviceId: string
}

export interface NcmApiResponse<TBody = unknown> {
  body: TBody
  cookie: string[]
  status: number
}

export type ModuleRequest = (
  uri: string,
  data: Record<string, unknown>,
  options?: CreateRequestOptions,
) => Promise<NcmApiResponse>

export interface ModuleDefinition {
  readonly identifier: string
  readonly module: (
    query: ModuleQuery,
    request: ModuleRequest,
  ) => Promise<NcmApiResponse> | NcmApiResponse
  readonly route: string
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

export interface GenerateConfigOptions {
  readonly fetcher?: FetchLike
  readonly state?: Partial<RuntimeState>
  readonly tokenFilePath?: string
}

export interface CreateServerOptions {
  readonly cacheEnabled?: boolean
  readonly cacheTtlMs?: number
  readonly corsAllowOrigin?: string
  readonly moduleDefinitions?: ModuleDefinition[]
  readonly modulesDirectory?: string
  readonly publicDirectory?: string
  readonly requestHandler?: ModuleRequest
  readonly serviceName?: string
  readonly serviceVersion?: string
}

/**
 * `startServer()` 的启动参数。
 */
export interface StartServerOptions extends CreateServerOptions {
  readonly hostname?: string
  readonly port?: number
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

export interface CreateModuleApiOptions {
  readonly moduleDefinitions?: ModuleDefinition[]
  readonly modulesDirectory?: string
  readonly requestHandler?: ModuleRequest
}

export type ProgrammaticModuleInvoker = (query?: ModuleQuery) => Promise<NcmApiResponse>

export type ProgrammaticApi = Record<string, ProgrammaticModuleInvoker>
