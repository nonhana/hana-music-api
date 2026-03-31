import type { CreateRequestOptions } from './request.ts'
import type { UnsafeUpstreamRecord, UpstreamBody } from './upstream.ts'

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

export interface NcmApiResponse<TBody = UpstreamBody> {
  body: TBody
  cookie: string[]
  status: number
}

export type ModuleRequest = <TBody = UnsafeUpstreamRecord>(
  uri: string,
  data: Record<string, unknown>,
  options?: CreateRequestOptions,
) => Promise<NcmApiResponse<TBody>>

export interface ModuleDefinition<
  TIdentifier extends string = string,
  TQuery extends ModuleQuery = ModuleQuery,
  TResponse extends NcmApiResponse = NcmApiResponse,
> {
  readonly identifier: TIdentifier
  readonly module: (query: TQuery, request: ModuleRequest) => Promise<TResponse> | TResponse
  readonly route: string
}
