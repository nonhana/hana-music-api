import { Schema } from 'effect';

import { UpstreamObject } from './upstream-body.ts';

// 云盘上传、没有匹配上曲库的歌，歌手和专辑的编号是 0、名字是 null（nonhana/hana-music-api#48）。
export const Artist = UpstreamObject({
  id: Schema.Finite,
  name: Schema.NullOr(Schema.String),
});

export const Song = UpstreamObject({
  id: Schema.Finite,
  name: Schema.String,
  ar: Schema.Array(Artist),
  al: UpstreamObject({
    id: Schema.Finite,
    name: Schema.NullOr(Schema.String),
    picUrl: Schema.String,
  }),
  dt: Schema.Finite,
  fee: Schema.Finite,
});

export const SongPrivilege = UpstreamObject({
  id: Schema.Finite,
  st: Schema.Finite,
  pl: Schema.Finite,
});

export const PlaylistUser = UpstreamObject({
  userId: Schema.Finite,
  nickname: Schema.String,
  accountStatus: Schema.optionalKey(Schema.Finite),
  authStatus: Schema.optionalKey(Schema.Finite),
  authenticationTypes: Schema.optionalKey(Schema.Finite),
  authority: Schema.optionalKey(Schema.Finite),
  avatarImgId: Schema.optionalKey(Schema.Finite),
  backgroundImgId: Schema.optionalKey(Schema.Finite),
  birthday: Schema.optionalKey(Schema.Finite),
  city: Schema.optionalKey(Schema.Finite),
  djStatus: Schema.optionalKey(Schema.Finite),
  gender: Schema.optionalKey(Schema.Finite),
  province: Schema.optionalKey(Schema.Finite),
  userType: Schema.optionalKey(Schema.Finite),
  vipType: Schema.optionalKey(Schema.Finite),
  avatarImgIdStr: Schema.optionalKey(Schema.String),
  avatarImgId_str: Schema.optionalKey(Schema.String),
  avatarUrl: Schema.optionalKey(Schema.String),
  description: Schema.optionalKey(Schema.String),
  detailDescription: Schema.optionalKey(Schema.String),
  signature: Schema.optionalKey(Schema.String),
  backgroundImgIdStr: Schema.optionalKey(Schema.String),
  backgroundUrl: Schema.optionalKey(Schema.NullOr(Schema.String)),
  anchor: Schema.optionalKey(Schema.Boolean),
  defaultAvatar: Schema.optionalKey(Schema.Boolean),
  followed: Schema.optionalKey(Schema.Boolean),
  mutual: Schema.optionalKey(Schema.Boolean),
  expertTags: Schema.optionalKey(Schema.NullOr(Schema.Array(Schema.String))),
  avatarDetail: Schema.optionalKey(Schema.NullOr(UpstreamObject({}))),
  experts: Schema.optionalKey(Schema.NullOr(UpstreamObject({}))),
});
export type PlaylistUser = typeof PlaylistUser.Type;

export const PlaylistSummary = UpstreamObject({
  id: Schema.Finite,
  name: Schema.String,
  coverImgUrl: Schema.String,
  trackCount: Schema.Finite,
  updateTime: Schema.Finite,
  trackUpdateTime: Schema.Finite,
  playCount: Schema.Finite,
  privacy: Schema.Finite,
  specialType: Schema.Finite,
  status: Schema.Finite,
  description: Schema.NullOr(Schema.String),
  tags: Schema.Array(Schema.String),
  // 凭据失效时网易云回匿名视角，subscribed 是 null，调用方靠它认出需要重新登录（#48）。
  subscribed: Schema.NullOr(Schema.Boolean),
  creator: PlaylistUser,
  adType: Schema.optionalKey(Schema.Finite),
  backgroundCoverId: Schema.optionalKey(Schema.Finite),
  cloudTrackCount: Schema.optionalKey(Schema.Finite),
  coverImgId: Schema.optionalKey(Schema.Finite),
  createTime: Schema.optionalKey(Schema.Finite),
  subscribedCount: Schema.optionalKey(Schema.Finite),
  titleImage: Schema.optionalKey(Schema.Finite),
  trackNumberUpdateTime: Schema.optionalKey(Schema.Finite),
  userId: Schema.optionalKey(Schema.Finite),
  commentThreadId: Schema.optionalKey(Schema.String),
  backgroundCoverUrl: Schema.optionalKey(Schema.NullOr(Schema.String)),
  coverImgId_str: Schema.optionalKey(Schema.NullOr(Schema.String)),
  englishTitle: Schema.optionalKey(Schema.NullOr(Schema.String)),
  titleImageUrl: Schema.optionalKey(Schema.NullOr(Schema.String)),
  updateFrequency: Schema.optionalKey(Schema.NullOr(Schema.String)),
  copied: Schema.optionalKey(Schema.Boolean),
  highQuality: Schema.optionalKey(Schema.Boolean),
  mix: Schema.optionalKey(Schema.Boolean),
  newImported: Schema.optionalKey(Schema.Boolean),
  opRecommend: Schema.optionalKey(Schema.Boolean),
  ordered: Schema.optionalKey(Schema.Boolean),
  subscribers: Schema.optionalKey(Schema.Array(PlaylistUser)),
});
export type PlaylistSummary = typeof PlaylistSummary.Type;
