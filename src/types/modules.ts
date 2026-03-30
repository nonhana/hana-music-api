import type { CookieRecord, ModuleQuery } from './runtime.ts'
import type { DynamicJsonRecord, UnsafeUpstreamRecord } from './upstream.ts'

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

type PasswordCredential =
  | {
      md5_password?: string
      password: string
    }
  | {
      md5_password: string
      password?: string
    }

export type LoginQuery = OptionCompatibleQuery &
  PasswordCredential & {
    email: string
  }

type LoginCellphoneBaseQuery = OptionCompatibleQuery & {
  countrycode?: QueryNumberLike
  phone: string
}

type LoginCellphoneCaptchaCredential = {
  captcha: string
  md5_password?: string
  password?: string
}

type LoginCellphonePasswordCredential = PasswordCredential & {
  captcha?: string
}

export type LoginCellphoneQuery = LoginCellphoneBaseQuery &
  (LoginCellphoneCaptchaCredential | LoginCellphonePasswordCredential)

export interface RegisterCellphoneQuery extends OptionCompatibleQuery {
  captcha: string
  countrycode?: QueryNumberLike
  nickname: string
  password: string
  phone: string
}

export interface UserBindingCellphoneQuery extends OptionCompatibleQuery {
  captcha?: string
  countrycode?: QueryNumberLike
  password?: string
  phone: string
}

export interface SearchQuery extends OptionCompatibleQuery {
  keywords: string
  limit?: QueryNumberLike
  offset?: QueryNumberLike
  type?: QueryNumberLike
}

export interface SongUrlQuery extends OptionCompatibleQuery {
  br?: QueryNumberLike
  id: QueryIdentifier
}

export interface SongUrlV1Query extends OptionCompatibleQuery {
  id: QueryIdentifier
  level?: 'standard' | 'higher' | 'exhigh' | 'lossless' | 'hires' | 'jyeffect' | 'sky' | 'jymaster'
}

export interface PlaylistDetailQuery extends OptionCompatibleQuery {
  id: QueryIdentifier
  s?: QueryNumberLike
}

export interface PlaylistTrackAllQuery extends PlaylistDetailQuery {
  limit?: number | string
  offset?: number | string
}

export interface UserAccountQuery extends OptionCompatibleQuery {}

export type BatchQuery = OptionCompatibleQuery &
  Partial<Record<BatchRouteKey, BatchSubRequest>> & {
    [key: string]: unknown
  }

export interface LoginQrCreateQuery extends OptionCompatibleQuery {
  key: string
  platform?: 'pc' | 'web' | (string & {})
  qrimg?: boolean | number | string
}

export interface LoginQrCheckQuery extends OptionCompatibleQuery {
  key: string
}

export interface VerifyGetQrQuery extends OptionCompatibleQuery {
  evid?: string
  sign?: string
  token?: string
  type?: number | string
  vid?: string
}

export interface CheckMusicQuery extends SongUrlQuery {}

export interface CloudImportQuery extends OptionCompatibleQuery {
  album?: string
  artist?: string
  bitrate?: QueryNumberLike
  fileSize?: QueryNumberLike
  fileType?: string
  id?: QueryIdentifier
  md5?: string
  song?: string
}

export interface CloudQuery extends OptionCompatibleQuery {
  songFile?: LegacyUploadedFile
}

export interface UploadImageQuery extends OptionCompatibleQuery {
  imgFile?: LegacyUploadedFile
}

export interface UploadSongQuery extends OptionCompatibleQuery {
  songFile?: LegacyUploadedFile
}

export interface VoiceUploadQuery extends OptionCompatibleQuery {
  autoPublish?: QueryBooleanLike
  autoPublishText?: string
  categoryId?: QueryIdentifier
  composedSongs?: string
  coverImgId?: QueryIdentifier
  description?: string
  orderNo?: QueryNumberLike
  privacy?: QueryBooleanLike
  publishTime?: QueryNumberLike
  secondCategoryId?: QueryIdentifier
  songFile?: LegacyUploadedFile
  songName?: string
  voiceListId?: QueryIdentifier
}

export interface ApiQuery extends OptionCompatibleQuery {
  crypto?: string
  data?: DynamicJsonRecord | string
  uri?: string
}

export interface RegisterAnonymousQuery extends OptionCompatibleQuery {}
