import type {
  AudioMatchQuery,
  BatchQuery,
  CommentEventQuery,
  CommentFloorQuery,
  CommentHotQuery,
  CommentLikeQuery,
  CommentNewQuery,
  CommentQuery,
  CommentThreadQuery,
  CheckMusicQuery,
  CloudImportQuery,
  CloudQuery,
  LoginCellphoneQuery,
  LoginQrCheckQuery,
  LoginQrCreateQuery,
  LoginQuery,
  PlaylistDetailQuery,
  PlaylistTrackAllQuery,
  RegisterAnonymousQuery,
  RegisterCellphoneQuery,
  SearchQuery,
  SongUrlQuery,
  SongUrlV1Query,
  UserDetailQuery,
  UserAccountQuery,
  VerifyGetQrQuery,
  VoiceUploadQuery,
} from './modules.ts'
import type { ModuleQuery, NcmApiResponse } from './runtime.ts'

export interface ModuleContractDefinition<
  TQuery extends ModuleQuery = ModuleQuery,
  TResponse extends NcmApiResponse = NcmApiResponse,
> {
  query: TQuery
  response: TResponse
}

export interface ModuleContractMap {
  audio_match: ModuleContractDefinition<AudioMatchQuery>
  batch: ModuleContractDefinition<BatchQuery>
  check_music: ModuleContractDefinition<CheckMusicQuery>
  comment: ModuleContractDefinition<CommentQuery>
  comment_album: ModuleContractDefinition<CommentThreadQuery>
  comment_dj: ModuleContractDefinition<CommentThreadQuery>
  comment_event: ModuleContractDefinition<CommentEventQuery>
  comment_floor: ModuleContractDefinition<CommentFloorQuery>
  comment_hot: ModuleContractDefinition<CommentHotQuery>
  comment_like: ModuleContractDefinition<CommentLikeQuery>
  comment_music: ModuleContractDefinition<CommentThreadQuery>
  comment_mv: ModuleContractDefinition<CommentThreadQuery>
  comment_new: ModuleContractDefinition<CommentNewQuery>
  comment_playlist: ModuleContractDefinition<CommentThreadQuery>
  comment_video: ModuleContractDefinition<CommentThreadQuery>
  cloud: ModuleContractDefinition<CloudQuery>
  cloud_import: ModuleContractDefinition<CloudImportQuery>
  login: ModuleContractDefinition<LoginQuery>
  login_cellphone: ModuleContractDefinition<LoginCellphoneQuery>
  login_qr_check: ModuleContractDefinition<LoginQrCheckQuery>
  login_qr_create: ModuleContractDefinition<LoginQrCreateQuery>
  playlist_detail: ModuleContractDefinition<PlaylistDetailQuery>
  playlist_track_all: ModuleContractDefinition<PlaylistTrackAllQuery>
  register_anonimous: ModuleContractDefinition<RegisterAnonymousQuery>
  register_cellphone: ModuleContractDefinition<RegisterCellphoneQuery>
  search: ModuleContractDefinition<SearchQuery>
  song_url: ModuleContractDefinition<SongUrlQuery>
  song_url_v1: ModuleContractDefinition<SongUrlV1Query>
  user_account: ModuleContractDefinition<UserAccountQuery>
  user_detail: ModuleContractDefinition<UserDetailQuery>
  verify_getQr: ModuleContractDefinition<VerifyGetQrQuery>
  voice_upload: ModuleContractDefinition<VoiceUploadQuery>
}

export type ModuleIdentifier = keyof ModuleContractMap

export type ModuleQueryOf<K extends ModuleIdentifier> = ModuleContractMap[K]['query']

export type ModuleResponseOf<K extends ModuleIdentifier> = ModuleContractMap[K]['response']

export type ProgrammaticModuleInvoker<
  TQuery extends ModuleQuery = ModuleQuery,
  TResponse extends NcmApiResponse = NcmApiResponse,
> = (query?: TQuery) => Promise<TResponse>

export type ProgrammaticApi<TContractMap extends object = ModuleContractMap> = {
  [K in keyof TContractMap]: TContractMap[K] extends ModuleContractDefinition
    ? ProgrammaticModuleInvoker<TContractMap[K]['query'], TContractMap[K]['response']>
    : never
}

export type DynamicProgrammaticApi = Record<string, ProgrammaticModuleInvoker>
