import type {
  BooleanLike,
  CookieRecord,
  FetchLike,
  RequestCrypto,
  RuntimeState,
} from './runtime.ts'

export type RequestConnectionStrategy = 'default' | 'close' | 'fresh-on-retry'

export interface RequestRetryOptions {
  readonly retries?: number
  readonly backoffMs?: number
  readonly maxBackoffMs?: number
  readonly jitter?: boolean
  readonly retryNonIdempotent?: boolean
  readonly statusCodes?: readonly number[]
}

export interface RequestDebugEvent {
  readonly attempt: number
  readonly connectionStrategy: RequestConnectionStrategy
  readonly crypto: RequestCrypto
  readonly delayMs?: number
  readonly durationMs?: number
  readonly error?: string
  readonly maxAttempts: number
  readonly status?: number
  readonly type: 'attempt' | 'failure' | 'retry'
  readonly url: string
}

export interface CreateRequestOptions {
  readonly checkToken?: BooleanLike
  readonly connectionStrategy?: RequestConnectionStrategy
  readonly cookie?: CookieRecord | string
  readonly crypto?: RequestCrypto
  readonly domain?: string
  readonly e_r?: BooleanLike
  readonly fetcher?: FetchLike
  readonly headers?: Record<string, string>
  readonly ip?: string
  readonly onRequestEvent?: (event: RequestDebugEvent) => void
  readonly proxy?: string
  readonly realIP?: string
  readonly retry?: RequestRetryOptions
  readonly state?: Partial<RuntimeState>
  readonly timeoutMs?: number
  readonly ua?: string
}

export interface GenerateConfigOptions {
  readonly fetcher?: FetchLike
  readonly state?: Partial<RuntimeState>
  readonly tokenFilePath?: string
}
