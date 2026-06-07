import type {
  AlbumSalesBoardType,
  AlbumStyleArea,
  ArtistPagedQuery,
  ArtistSongsOrder,
  BatchRouteKey,
  BatchSubRequest,
  CommentResourceQuery,
  IdentifierQuery,
  LegacyUploadedFile,
  OptionCompatibleQuery,
  PagedQuery,
  QueryBooleanLike,
  QueryIdentifier,
  QueryNumberLike,
  UserScopedListQuery,
  UserScopedQuery,
} from './module-shared.ts'

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

export interface SearchQuery extends PagedQuery {
  keywords: string
  type?: QueryNumberLike
}

export interface CommentEventQuery extends PagedQuery {
  before?: QueryNumberLike
  threadId: string
}

export interface CommentHotQuery extends CommentResourceQuery {
  before?: QueryNumberLike
  limit?: QueryNumberLike
  offset?: QueryNumberLike
}

export interface CommentQuery extends CommentResourceQuery {
  commentId?: QueryIdentifier
  content?: string
  t: 0 | 1 | 2 | '0' | '1' | '2'
  threadId?: string
}

export interface CommentFloorQuery extends CommentResourceQuery {
  limit?: QueryNumberLike
  parentCommentId: QueryIdentifier
  time?: QueryNumberLike
}

export interface CommentLikeQuery extends CommentResourceQuery {
  cid: QueryIdentifier
  t: 0 | 1 | '0' | '1'
  threadId?: string
}

export interface CommentNewQuery extends CommentResourceQuery {
  cursor?: string
  pageNo?: QueryNumberLike
  pageSize?: QueryNumberLike
  showInner?: QueryBooleanLike
  sortType?: QueryNumberLike
}

export interface AlbumListStyleQuery extends PagedQuery {
  area?: AlbumStyleArea
}

export interface AlbumNewestQuery extends OptionCompatibleQuery {}

export interface AlbumSongsaleboardQuery extends OptionCompatibleQuery {
  albumType?: QueryNumberLike
  type?: AlbumSalesBoardType
  year?: QueryNumberLike
}

export interface ArtistSongsQuery extends ArtistPagedQuery {
  order?: ArtistSongsOrder
}

export interface SongUrlQuery extends IdentifierQuery {
  br?: QueryNumberLike
}

export interface SongUrlV1Query extends IdentifierQuery {
  level?: 'standard' | 'higher' | 'exhigh' | 'lossless' | 'hires' | 'jyeffect' | 'sky' | 'jymaster'
}

export interface PlaylistDetailQuery extends IdentifierQuery {
  s?: QueryNumberLike
}

export interface PlaylistTrackAllQuery extends PlaylistDetailQuery {
  limit?: QueryNumberLike
  offset?: QueryNumberLike
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

export interface AudioMatchQuery extends OptionCompatibleQuery {
  audioFP: string
  duration: QueryNumberLike
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

export interface UserEventQuery extends UserScopedListQuery {
  lasttime?: QueryNumberLike
}

export interface UserRecordQuery extends UserScopedQuery {
  type?: 0 | 1 | '0' | '1'
}

export interface UserFollowMixedQuery extends OptionCompatibleQuery {
  cursor?: QueryNumberLike
  scene?: 0 | 1 | 2 | '0' | '1' | '2'
  size?: QueryNumberLike
}

export interface RegisterAnonymousQuery extends OptionCompatibleQuery {}
