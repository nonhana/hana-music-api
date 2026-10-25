import { Schema } from 'effect';

import { Loose, UpstreamObject } from './upstream-body.ts';

// 云盘上传、没有匹配上曲库的歌，歌手和专辑的编号是 0、名字是 null（nonhana/hana-music-api#48）。
export const Artist = UpstreamObject({
  id: Loose(Schema.Finite),
  name: Loose(Schema.String),
  accountId: Loose(Schema.Finite),
  albumSize: Loose(Schema.Finite),
  alia: Loose(Schema.Array(Schema.String)),
  alias: Loose(Schema.Array(Schema.String)),
  briefDesc: Loose(Schema.String),
  followed: Loose(Schema.Boolean),
  img1v1: Loose(Schema.Finite),
  img1v1Id: Loose(Schema.Finite),
  img1v1Id_str: Loose(Schema.String),
  img1v1Url: Loose(Schema.String),
  musicSize: Loose(Schema.Finite),
  mvSize: Loose(Schema.Finite),
  picId: Loose(Schema.Finite),
  picId_str: Loose(Schema.String),
  picUrl: Loose(Schema.String),
  tns: Loose(Schema.Array(Schema.String)),
  topicPerson: Loose(Schema.Finite),
  trans: Loose(Schema.String),
  transNames: Loose(Schema.Array(Schema.String)),
});

const Quality = UpstreamObject({
  br: Loose(Schema.Finite),
  fid: Loose(Schema.Finite),
  size: Loose(Schema.Finite),
  sr: Loose(Schema.Finite),
  vd: Loose(Schema.Finite),
});

const SongAlbum = UpstreamObject({
  id: Loose(Schema.Finite),
  name: Loose(Schema.String),
  picUrl: Loose(Schema.String),
  alia: Loose(Schema.Array(Schema.String)),
  pic: Loose(Schema.Finite),
  pic_str: Loose(Schema.String),
  tns: Loose(Schema.Array(Schema.String)),
});

const PrivateCloud = UpstreamObject({
  addTime: Loose(Schema.Finite),
  album: Loose(Schema.String),
  artist: Loose(Schema.String),
  bitrate: Loose(Schema.Finite),
  convertLyric: Loose(Schema.Finite),
  cover: Loose(Schema.Finite),
  cue: Loose(Schema.Finite),
  fileName: Loose(Schema.String),
  fileSize: Loose(Schema.Finite),
  id: Loose(Schema.Finite),
  lrcType: Loose(Schema.String),
  lyric: Loose(Schema.Finite),
  md5: Loose(Schema.String),
  originalAudioSongId: Loose(Schema.Finite),
  song: Loose(Schema.String),
  songDfsId: Loose(Schema.Finite),
  songId: Loose(Schema.Finite),
  status: Loose(Schema.Finite),
  userId: Loose(Schema.Finite),
  version: Loose(Schema.Finite),
});

const PcInfo = UpstreamObject({
  alb: Loose(Schema.String),
  ar: Loose(Schema.String),
  br: Loose(Schema.Finite),
  cid: Loose(Schema.String),
  fn: Loose(Schema.String),
  nickname: Loose(Schema.String),
  privateCloud: Loose(PrivateCloud),
  sn: Loose(Schema.String),
  uid: Loose(Schema.Finite),
  version: Loose(Schema.Finite),
});

export const SimpleAlbum = UpstreamObject({
  id: Loose(Schema.Finite),
  name: Loose(Schema.String),
  artist: Loose(Artist),
  artists: Loose(Schema.Array(Artist)),
  alias: Loose(Schema.Array(Schema.String)),
  blurPicUrl: Loose(Schema.String),
  briefDesc: Loose(Schema.String),
  commentThreadId: Loose(Schema.String),
  company: Loose(Schema.String),
  companyId: Loose(Schema.Finite),
  copyrightId: Loose(Schema.Finite),
  description: Loose(Schema.String),
  gapless: Loose(Schema.Finite),
  idStr: Loose(Schema.String),
  info: Loose(UpstreamObject({})),
  isSub: Loose(Schema.Boolean),
  mark: Loose(Schema.Finite),
  onSale: Loose(Schema.Boolean),
  paid: Loose(Schema.Boolean),
  pic: Loose(Schema.Finite),
  picId: Loose(Schema.Finite),
  picId_str: Loose(Schema.String),
  picUrl: Loose(Schema.String),
  publishTime: Loose(Schema.Finite),
  size: Loose(Schema.Finite),
  status: Loose(Schema.Finite),
  subType: Loose(Schema.String),
  tags: Loose(Schema.String),
  transNames: Loose(Schema.Array(Schema.String)),
  type: Loose(Schema.String),
});

export const SongPrivilege = UpstreamObject({
  id: Schema.Finite,
  st: Loose(Schema.Finite),
  pl: Loose(Schema.Finite),
  chargeInfoList: Loose(
    Schema.Array(
      UpstreamObject({
        chargeType: Loose(Schema.Finite),
        rate: Loose(Schema.Finite),
      }),
    ),
  ),
  code: Loose(Schema.Finite),
  cp: Loose(Schema.Finite),
  cs: Loose(Schema.Boolean),
  dl: Loose(Schema.Finite),
  dlLevel: Loose(Schema.String),
  downloadMaxBrLevel: Loose(Schema.String),
  downloadMaxbr: Loose(Schema.Finite),
  fee: Loose(Schema.Finite),
  fl: Loose(Schema.Finite),
  flLevel: Loose(Schema.String),
  flag: Loose(Schema.Finite),
  freeTrialPrivilege: Loose(
    UpstreamObject({
      cannotListenReason: Loose(Schema.Finite),
      listenType: Loose(Schema.Finite),
      resConsumable: Loose(Schema.Boolean),
      userConsumable: Loose(Schema.Boolean),
    }),
  ),
  maxBrLevel: Loose(Schema.String),
  maxbr: Loose(Schema.Finite),
  paidBigBang: Loose(Schema.Boolean),
  payed: Loose(Schema.Finite),
  plLevel: Loose(Schema.String),
  playMaxBrLevel: Loose(Schema.String),
  playMaxbr: Loose(Schema.Finite),
  preSell: Loose(Schema.Boolean),
  realPayed: Loose(Schema.Finite),
  rightSource: Loose(Schema.Finite),
  rscl: Loose(Schema.Finite),
  sp: Loose(Schema.Finite),
  subp: Loose(Schema.Finite),
  toast: Loose(Schema.Boolean),
});

// 宽松容器里嵌着的权限：记录编号也宽松。
export const LooseSongPrivilege = UpstreamObject({
  ...SongPrivilege.schema.fields,
  id: Loose(Schema.Finite),
});

const SongMarkTag = UpstreamObject({
  tagKey: Loose(Schema.String),
  tagValue: Loose(Schema.String),
});

export const Song = UpstreamObject({
  id: Schema.Finite,
  name: Loose(Schema.String),
  ar: Loose(Schema.Array(Artist)),
  al: Loose(SongAlbum),
  dt: Loose(Schema.Finite),
  fee: Loose(Schema.Finite),
  // 导出要用的字段：云盘上传、没匹配上曲库的歌 `cd` 是 null，`no` 为 0 表示没有；
  // 专辑接口里的歌没有 `publishTime`。
  no: Loose(Schema.Finite),
  cd: Loose(Schema.String),
  alia: Loose(Schema.Array(Schema.String)),
  tns: Loose(Schema.Array(Schema.String)),
  publishTime: Loose(Schema.Finite),
  additionalTitle: Loose(Schema.String),
  alg: Loose(Schema.String),
  alias: Loose(Schema.Array(Schema.String)),
  album: Loose(SimpleAlbum),
  artists: Loose(Schema.Array(Artist)),
  artistClassics: Loose(Schema.Boolean),
  awardName: Loose(Schema.String),
  cf: Loose(Schema.String),
  copyright: Loose(Schema.Finite),
  copyrightId: Loose(Schema.Finite),
  cp: Loose(Schema.Finite),
  djId: Loose(Schema.Finite),
  displayReason: Loose(Schema.String),
  duration: Loose(Schema.Finite),
  ftype: Loose(Schema.Finite),
  h: Loose(Quality),
  hr: Loose(Quality),
  l: Loose(Quality),
  m: Loose(Quality),
  mainTitle: Loose(Schema.String),
  mark: Loose(Schema.Finite),
  markTags: Loose(Schema.Array(SongMarkTag)),
  mst: Loose(Schema.Finite),
  mv: Loose(Schema.Finite),
  mvid: Loose(Schema.Finite),
  noCopyrightRcmd: Loose(
    UpstreamObject({
      type: Loose(Schema.Finite),
      typeDesc: Loose(Schema.String),
    }),
  ),
  originCoverType: Loose(Schema.Finite),
  originSongSimpleData: Loose(
    UpstreamObject({
      albumMeta: Loose(
        UpstreamObject({
          id: Loose(Schema.Finite),
          name: Loose(Schema.String),
        }),
      ),
      artists: Loose(Schema.Array(Artist)),
      name: Loose(Schema.String),
      songId: Loose(Schema.Finite),
    }),
  ),
  pc: Loose(PcInfo),
  pop: Loose(Schema.Finite),
  privilege: Loose(LooseSongPrivilege),
  pst: Loose(Schema.Finite),
  reason: Loose(Schema.String),
  recommendReason: Loose(Schema.String),
  resourceState: Loose(Schema.Boolean),
  rt: Loose(Schema.String),
  rtype: Loose(Schema.Finite),
  s_id: Loose(Schema.Finite),
  single: Loose(Schema.Finite),
  sq: Loose(Quality),
  st: Loose(Schema.Finite),
  status: Loose(Schema.Finite),
  t: Loose(Schema.Finite),
  transNames: Loose(Schema.Array(Schema.String)),
  v: Loose(Schema.Finite),
  version: Loose(Schema.Finite),
});

// 歌单里嵌着的歌曲：宽松容器里的记录，编号也宽松。
const PlaylistTrack = UpstreamObject({
  ...Song.schema.fields,
  id: Loose(Schema.Finite),
});

const AuthType = UpstreamObject({
  desc: Loose(Schema.String),
  tags: Loose(Schema.Array(Schema.String)),
  type: Loose(Schema.Finite),
});

const AvatarDetail = UpstreamObject({
  identityIconUrl: Loose(Schema.String),
  identityLevel: Loose(Schema.Finite),
  userType: Loose(Schema.Finite),
});

const PrivacyItemUnlimit = UpstreamObject({
  age: Loose(Schema.Boolean),
  area: Loose(Schema.Boolean),
  college: Loose(Schema.Boolean),
  gender: Loose(Schema.Boolean),
  villageAge: Loose(Schema.Boolean),
});

export const PlaylistUser = UpstreamObject({
  userId: Loose(Schema.Finite),
  nickname: Loose(Schema.String),
  accountStatus: Loose(Schema.Finite),
  authStatus: Loose(Schema.Finite),
  authenticationTypes: Loose(Schema.Finite),
  authority: Loose(Schema.Finite),
  avatarImgId: Loose(Schema.Finite),
  backgroundImgId: Loose(Schema.Finite),
  birthday: Loose(Schema.Finite),
  city: Loose(Schema.Finite),
  djStatus: Loose(Schema.Finite),
  gender: Loose(Schema.Finite),
  province: Loose(Schema.Finite),
  userType: Loose(Schema.Finite),
  vipType: Loose(Schema.Finite),
  avatarImgIdStr: Loose(Schema.String),
  avatarImgId_str: Loose(Schema.String),
  avatarUrl: Loose(Schema.String),
  description: Loose(Schema.String),
  detailDescription: Loose(Schema.String),
  signature: Loose(Schema.String),
  backgroundImgIdStr: Loose(Schema.String),
  backgroundUrl: Loose(Schema.String),
  anchor: Loose(Schema.Boolean),
  defaultAvatar: Loose(Schema.Boolean),
  followed: Loose(Schema.Boolean),
  mutual: Loose(Schema.Boolean),
  expertTags: Loose(Schema.Array(Schema.String)),
  avatarDetail: Loose(AvatarDetail),
  experts: Loose(Schema.Record(Schema.String, Schema.String)),
});
export type PlaylistUser = typeof PlaylistUser.Type;

export const Account = UpstreamObject({
  id: Schema.Finite,
  anonimousUser: Loose(Schema.Boolean),
  ban: Loose(Schema.Finite),
  baoyueVersion: Loose(Schema.Finite),
  createTime: Loose(Schema.Finite),
  donateVersion: Loose(Schema.Finite),
  paidFee: Loose(Schema.Boolean),
  salt: Loose(Schema.String),
  status: Loose(Schema.Finite),
  tokenVersion: Loose(Schema.Finite),
  type: Loose(Schema.Finite),
  uninitialized: Loose(Schema.Boolean),
  userName: Loose(Schema.String),
  vipType: Loose(Schema.Finite),
  viptypeVersion: Loose(Schema.Finite),
  whitelistAuthority: Loose(Schema.Finite),
});
export type Account = typeof Account.Type;

export const UserProfile = UpstreamObject({
  userId: Schema.Finite,
  accountStatus: Loose(Schema.Finite),
  accountType: Loose(Schema.Finite),
  allAuthTypes: Loose(Schema.Array(AuthType)),
  allSubscribedCount: Loose(Schema.Finite),
  anchor: Loose(Schema.Boolean),
  artistId: Loose(Schema.Finite),
  artistIdentity: Loose(Schema.Array(Schema.Finite)),
  artistName: Loose(Schema.String),
  authStatus: Loose(Schema.Finite),
  authenticated: Loose(Schema.Boolean),
  authenticationTypes: Loose(Schema.Finite),
  authority: Loose(Schema.Finite),
  avatarDetail: Loose(AvatarDetail),
  avatarImgId: Loose(Schema.Finite),
  avatarImgIdStr: Loose(Schema.String),
  avatarImgId_str: Loose(Schema.String),
  avatarUrl: Loose(Schema.String),
  backgroundImgId: Loose(Schema.Finite),
  backgroundImgIdStr: Loose(Schema.String),
  backgroundUrl: Loose(Schema.String),
  birthday: Loose(Schema.Finite),
  blacklist: Loose(Schema.Boolean),
  cCount: Loose(Schema.Finite),
  city: Loose(Schema.Finite),
  createTime: Loose(Schema.Finite),
  defaultAvatar: Loose(Schema.Boolean),
  description: Loose(Schema.String),
  detailDescription: Loose(Schema.String),
  djStatus: Loose(Schema.Finite),
  eventCount: Loose(Schema.Finite),
  experts: Loose(Schema.Record(Schema.String, Schema.String)),
  followMe: Loose(Schema.Boolean),
  followed: Loose(Schema.Boolean),
  followeds: Loose(Schema.Finite),
  follows: Loose(Schema.Finite),
  gender: Loose(Schema.Finite),
  inBlacklist: Loose(Schema.Boolean),
  lastLoginIP: Loose(Schema.String),
  lastLoginTime: Loose(Schema.Finite),
  locationStatus: Loose(Schema.Finite),
  mainAuthType: Loose(AuthType),
  mutual: Loose(Schema.Boolean),
  newFollows: Loose(Schema.Finite),
  nickname: Loose(Schema.String),
  playlistBeSubscribedCount: Loose(Schema.Finite),
  playlistCount: Loose(Schema.Finite),
  privacyItemUnlimit: Loose(PrivacyItemUnlimit),
  province: Loose(Schema.Finite),
  sCount: Loose(Schema.Finite),
  sDJPCount: Loose(Schema.Finite),
  shortUserName: Loose(Schema.String),
  signature: Loose(Schema.String),
  userName: Loose(Schema.String),
  userType: Loose(Schema.Finite),
  vipType: Loose(Schema.Finite),
  viptypeVersion: Loose(Schema.Finite),
});
export type UserProfile = typeof UserProfile.Type;

export const PlaylistSummary = UpstreamObject({
  id: Schema.Finite,
  name: Loose(Schema.String),
  coverImgUrl: Loose(Schema.String),
  trackCount: Loose(Schema.Finite),
  updateTime: Loose(Schema.Finite),
  trackUpdateTime: Loose(Schema.Finite),
  playCount: Loose(Schema.Finite),
  privacy: Loose(Schema.Finite),
  specialType: Loose(Schema.Finite),
  status: Loose(Schema.Finite),
  description: Loose(Schema.String),
  tags: Loose(Schema.Array(Schema.String)),
  // 凭据失效时网易云回匿名视角，subscribed 是 null，调用方靠它认出需要重新登录（#48）。
  subscribed: Loose(Schema.Boolean),
  creator: Loose(PlaylistUser),
  adType: Loose(Schema.Finite),
  backgroundCoverId: Loose(Schema.Finite),
  cloudTrackCount: Loose(Schema.Finite),
  coverImgId: Loose(Schema.Finite),
  createTime: Loose(Schema.Finite),
  subscribedCount: Loose(Schema.Finite),
  titleImage: Loose(Schema.Finite),
  trackNumberUpdateTime: Loose(Schema.Finite),
  userId: Loose(Schema.Finite),
  commentThreadId: Loose(Schema.String),
  backgroundCoverUrl: Loose(Schema.String),
  coverImgId_str: Loose(Schema.String),
  englishTitle: Loose(Schema.String),
  titleImageUrl: Loose(Schema.String),
  updateFrequency: Loose(Schema.String),
  copied: Loose(Schema.Boolean),
  highQuality: Loose(Schema.Boolean),
  mix: Loose(Schema.Boolean),
  newImported: Loose(Schema.Boolean),
  opRecommend: Loose(Schema.Boolean),
  ordered: Loose(Schema.Boolean),
  subscribers: Loose(Schema.Array(PlaylistUser)),
  ToplistType: Loose(Schema.String),
  algTags: Loose(Schema.Array(Schema.String)),
  anonimous: Loose(Schema.Boolean),
  bizExtInfo: Loose(UpstreamObject({})),
  commentCount: Loose(Schema.Finite),
  containsTracks: Loose(Schema.Boolean),
  coverStatus: Loose(Schema.Finite),
  detailPageTitle: Loose(Schema.String),
  displayUserInfoAsTagOnly: Loose(Schema.Boolean),
  gradeStatus: Loose(Schema.String),
  mixPodcastPlaylist: Loose(Schema.Boolean),
  officialPlaylistType: Loose(Schema.String),
  playlistType: Loose(Schema.String),
  podcastTrackCount: Loose(Schema.Finite),
  recommendInfo: Loose(UpstreamObject({})),
  relateResType: Loose(Schema.String),
  shareCount: Loose(Schema.Finite),
  top: Loose(Schema.Boolean),
  totalDuration: Loose(Schema.Finite),
  tracks: Loose(Schema.Array(PlaylistTrack)),
  trialMode: Loose(Schema.Finite),
  uiPlaylistType: Loose(Schema.String),
});
export type PlaylistSummary = typeof PlaylistSummary.Type;

const CommentThreadResourceInfo = UpstreamObject({
  id: Loose(Schema.Finite),
  imgUrl: Loose(Schema.String),
  name: Loose(Schema.String),
  userId: Loose(Schema.Finite),
});

const CommentThread = UpstreamObject({
  commentCount: Loose(Schema.Finite),
  hotCount: Loose(Schema.Finite),
  id: Loose(Schema.String),
  likedCount: Loose(Schema.Finite),
  resourceId: Loose(Schema.Finite),
  resourceInfo: Loose(CommentThreadResourceInfo),
  resourceOwnerId: Loose(Schema.Finite),
  resourceTitle: Loose(Schema.String),
  resourceType: Loose(Schema.Finite),
  shareCount: Loose(Schema.Finite),
});

const CommentVipRight = UpstreamObject({
  iconUrl: Loose(Schema.String),
  rights: Loose(Schema.Boolean),
  vipCode: Loose(Schema.Finite),
});

const CommentVipRights = UpstreamObject({
  associator: Loose(CommentVipRight),
  musicPackage: Loose(CommentVipRight),
  redplus: Loose(CommentVipRight),
  redVipAnnualCount: Loose(Schema.Finite),
  redVipLevel: Loose(Schema.Finite),
  relationType: Loose(Schema.Finite),
});

// 评论里的用户是附带信息，字段全部宽松；五个固定资源评论列表的用户结构一致。
export const CommentUser = UpstreamObject({
  anonym: Loose(Schema.Finite),
  authStatus: Loose(Schema.Finite),
  avatarDetail: Loose(AvatarDetail),
  avatarUrl: Loose(Schema.String),
  followed: Loose(Schema.Boolean),
  highlight: Loose(Schema.Boolean),
  mutual: Loose(Schema.Boolean),
  nickname: Loose(Schema.String),
  userId: Loose(Schema.Finite),
  userType: Loose(Schema.Finite),
  vipRights: Loose(CommentVipRights),
  vipType: Loose(Schema.Finite),
});
export type CommentUser = typeof CommentUser.Type;

const CommentIpLocation = UpstreamObject({
  location: Loose(Schema.String),
  userId: Loose(Schema.Finite),
});

// 主评论里的回复是嵌套记录，编号 `beRepliedCommentId` 和字段都宽松。
export const CommentReply = UpstreamObject({
  beRepliedCommentId: Loose(Schema.Finite),
  content: Loose(Schema.String),
  ipLocation: Loose(CommentIpLocation),
  richContent: Loose(Schema.String),
  status: Loose(Schema.Finite),
  user: Loose(CommentUser),
});
export type CommentReply = typeof CommentReply.Type;

const CommentDecoration = UpstreamObject({
  repliedByAuthorCount: Loose(Schema.Finite),
});

const CommentPendant = UpstreamObject({
  id: Loose(Schema.Finite),
  imageUrl: Loose(Schema.String),
});

// 五个固定资源评论列表共用的评论记录：`commentId` 是记录自己的编号，其余字段宽松。
export const CommentRecord = UpstreamObject({
  beReplied: Loose(Schema.Array(CommentReply)),
  commentId: Schema.Finite,
  commentLocationType: Loose(Schema.Finite),
  content: Loose(Schema.String),
  decoration: Loose(CommentDecoration),
  favorited: Loose(Schema.Boolean),
  ipLocation: Loose(CommentIpLocation),
  liked: Loose(Schema.Boolean),
  likedCount: Loose(Schema.Finite),
  needDisplayTime: Loose(Schema.Boolean),
  owner: Loose(Schema.Boolean),
  parentCommentId: Loose(Schema.Finite),
  pendantData: Loose(CommentPendant),
  richContent: Loose(Schema.String),
  status: Loose(Schema.Finite),
  time: Loose(Schema.Finite),
  timeStr: Loose(Schema.String),
  user: Loose(CommentUser),
});
export type CommentRecord = typeof CommentRecord.Type;

export const AlbumInfo = UpstreamObject({
  commentCount: Loose(Schema.Finite),
  commentThread: Loose(CommentThread),
  liked: Loose(Schema.Boolean),
  likedCount: Loose(Schema.Finite),
  resourceId: Loose(Schema.Finite),
  resourceType: Loose(Schema.Finite),
  shareCount: Loose(Schema.Finite),
  threadId: Loose(Schema.String),
});

export const LyricUser = UpstreamObject({
  demand: Loose(Schema.Finite),
  id: Loose(Schema.Finite),
  nickname: Loose(Schema.String),
  status: Loose(Schema.Finite),
  uptime: Loose(Schema.Finite),
  userid: Loose(Schema.Finite),
});

export const AlbumSummary = UpstreamObject({
  ...SimpleAlbum.schema.fields,
  id: Schema.Finite,
  info: Loose(AlbumInfo),
});

// mv_all、mv_first、mv_exclusive_rcmd、top_mv 共用的 MV 列表记录，字段一致；`desc` 在各录制里只见过 null，未声明，`alias`/`transNames` 只在部分接口出现、声明为宽松字段。
export const MvSummary = UpstreamObject({
  id: Schema.Finite,
  alias: Loose(Schema.Array(Schema.String)),
  artistId: Loose(Schema.Finite),
  artistName: Loose(Schema.String),
  artists: Loose(Schema.Array(Artist)),
  briefDesc: Loose(Schema.String),
  cover: Loose(Schema.String),
  duration: Loose(Schema.Finite),
  mark: Loose(Schema.Finite),
  name: Loose(Schema.String),
  playCount: Loose(Schema.Finite),
  subed: Loose(Schema.Boolean),
  transNames: Loose(Schema.Array(Schema.String)),
});
