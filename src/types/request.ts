import type { BooleanLike, CookieRecord, FetchLike, RequestCrypto, RuntimeState } from './runtime.ts'

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
