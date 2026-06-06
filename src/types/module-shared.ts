import type { CookieRecord, ModuleQuery } from './runtime.ts'
import type { UnsafeUpstreamRecord } from './upstream.ts'

export type LegacyModulePrimitive = boolean | number | string
export type QueryBooleanLike = boolean | 0 | 1 | '0' | '1' | 'true' | 'false'

export interface LegacyUploadedFile {
  data: ArrayBuffer | Buffer | Uint8Array
  md5?: string
  mimetype: string
  name: string
  size: number
}

export type LegacyModuleValue = UnsafeUpstreamRecord[string]
export type QueryNumberLike = number | `${number}`
export type QueryIdentifier = string | number
export type BatchRouteKey = `/api/${string}`
export type BatchSubRequest = Record<string, unknown>
export type AlbumArea = 'ALL' | 'ZH' | 'EA' | 'KR' | 'JP' | (string & {})
export type AlbumStyleArea = 'Z_H' | 'E_A' | 'KR' | 'JP' | (string & {})
export type AlbumSalesBoardType = 'daily' | 'week' | 'year' | 'total' | (string & {})
export type ArtistSongsOrder = 'hot' | 'time' | (string & {})

export interface LegacyModuleQuery extends ModuleQuery {
  [key: string]: LegacyModuleValue
}

export interface OptionCompatibleQuery extends LegacyModuleQuery {
  checkToken?: boolean | number | string
  cookie?: CookieRecord | string
  crypto?: string
  domain?: string
  e_r?: boolean | number | string
  proxy?: string
  realIP?: string
  ua?: string
}

export interface IdentifierQuery extends OptionCompatibleQuery {
  id: QueryIdentifier
}

export interface PagedQuery extends OptionCompatibleQuery {
  limit?: QueryNumberLike
  offset?: QueryNumberLike
}

export interface IdentifierPagedQuery extends IdentifierQuery {
  limit?: QueryNumberLike
  offset?: QueryNumberLike
}

export interface IdentifierActionQuery extends IdentifierQuery {
  t: 0 | 1 | '0' | '1'
}

export interface CommentThreadQuery extends IdentifierPagedQuery {
  before?: QueryNumberLike
}

export interface CommentResourceQuery extends IdentifierQuery {
  type: QueryNumberLike
}

export interface AlbumQuery extends IdentifierQuery {}

export interface AlbumListQuery extends PagedQuery {
  area?: AlbumArea
  type?: QueryNumberLike
}

export interface AlbumSubQuery extends IdentifierActionQuery {}

export interface AlbumSublistQuery extends PagedQuery {}

export interface ArtistQuery extends IdentifierQuery {}

export interface ArtistPagedQuery extends ArtistQuery {
  limit?: QueryNumberLike
  offset?: QueryNumberLike
}

export interface ArtistSubQuery extends IdentifierActionQuery {}

export interface ArtistSublistQuery extends PagedQuery {}

export interface UserDetailQuery extends OptionCompatibleQuery {
  uid: QueryIdentifier
}

export interface UserScopedQuery extends OptionCompatibleQuery {
  uid: QueryIdentifier
}

export interface UserScopedListQuery extends UserScopedQuery {
  limit?: QueryNumberLike
  offset?: QueryNumberLike
}

export interface UserSummaryQuery extends OptionCompatibleQuery {}
