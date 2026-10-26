import { Effect, Schema } from 'effect';

import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import {
  decodeUpstreamBody,
  Loose,
  UpstreamObject,
} from '../core/upstream-body.ts';
import {
  AvatarDetail,
  LooseSongPrivilege,
  MlogSong,
} from '../core/upstream-schemas.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';

const MlogCoverImage = UpstreamObject({
  height: Loose(Schema.Finite),
  imageUrl: Loose(Schema.String),
  nosKey: Loose(Schema.String),
  picKey: Loose(Schema.String),
  width: Loose(Schema.Finite),
});

const MlogCoverDetail = UpstreamObject({
  horizontalCoverImage: Loose(MlogCoverImage),
  verticalCoverImage: Loose(MlogCoverImage),
});

// 视频地址的通用信息：`url` 只作为宽松字段声明，接口要拿的那一项单独用下面的收紧结构。
const MlogUrlInfo = UpstreamObject({
  id: Loose(Schema.String),
  r: Loose(Schema.Finite),
  resolution: Loose(Schema.Finite),
  size: Loose(Schema.Finite),
  url: Loose(Schema.String),
  validityTime: Loose(Schema.Finite),
});

const MlogPlaybackUrlInfo = UpstreamObject({
  ...MlogUrlInfo.schema.fields,
  url: Schema.String,
});

const MlogVideoAreaInfo = UpstreamObject({
  leftTopX: Loose(Schema.Finite),
  leftTopY: Loose(Schema.Finite),
  rightBottomX: Loose(Schema.Finite),
  rightBottomY: Loose(Schema.Finite),
});

const MlogVideo = UpstreamObject({
  coverDetail: Loose(MlogCoverDetail),
  coverImage: Loose(MlogCoverImage),
  coverImageTime: Loose(Schema.Finite),
  coverUrl: Loose(Schema.String),
  duration: Loose(Schema.Finite),
  frameImage: Loose(MlogCoverImage),
  frameUrl: Loose(Schema.String),
  height: Loose(Schema.Finite),
  nosKey: Loose(Schema.String),
  playCount: Loose(Schema.Finite),
  r: Loose(Schema.Finite),
  rcmdUrlInfo: Loose(MlogUrlInfo),
  size: Loose(Schema.Finite),
  urlInfo: MlogPlaybackUrlInfo,
  urlInfos: Loose(Schema.Array(MlogUrlInfo)),
  videoAreaInfo: Loose(MlogVideoAreaInfo),
  videoKey: Loose(Schema.String),
  width: Loose(Schema.Finite),
});

const MlogContentSong = UpstreamObject({
  ...MlogSong.schema.fields,
  endTime: Loose(Schema.Finite),
  isLiked: Loose(Schema.Boolean),
  privilege: Loose(LooseSongPrivilege),
  startTime: Loose(Schema.Finite),
});

const MlogContent = UpstreamObject({
  containAiContent: Loose(Schema.Boolean),
  coverColor: Loose(Schema.Finite),
  coverExt: Loose(Schema.String),
  creationEntranceDesc: Loose(Schema.String),
  creationTagType: Loose(Schema.Finite),
  eventId: Loose(Schema.Finite),
  eventPinned: Loose(Schema.Boolean),
  interveneText: Loose(Schema.String),
  privacySetting: Loose(Schema.Finite),
  realateSongs: Loose(Schema.Array(MlogContentSong)),
  relateSongs: Loose(Schema.Array(MlogContentSong)),
  song: Loose(MlogContentSong),
  songs: Loose(Schema.Array(MlogContentSong)),
  text: Loose(Schema.String),
  title: Loose(Schema.String),
  video: MlogVideo,
  videoId: Loose(Schema.String),
});

const MlogProfile = UpstreamObject({
  avatarDetail: Loose(AvatarDetail),
  avatarUrl: Loose(Schema.String),
  followed: Loose(Schema.Boolean),
  isAnchor: Loose(Schema.Boolean),
  nickname: Loose(Schema.String),
  userId: Loose(Schema.Finite),
  userType: Loose(Schema.Finite),
});

const MlogLikeGuide = UpstreamObject({
  afterViewSeconds: Loose(Schema.Finite),
  hasGuide: Loose(Schema.Boolean),
});

const MlogOperate = UpstreamObject({
  disShowCollectReason: Loose(Schema.String),
  hasBiubiuComments: Loose(Schema.Boolean),
  playMode: Loose(Schema.Finite),
  showCollect: Loose(Schema.Boolean),
  showMvTag: Loose(Schema.Boolean),
});

const MlogIpLocation = UpstreamObject({
  location: Loose(Schema.String),
});

const MlogResource = UpstreamObject({
  id: Schema.String,
  audioStatus: Loose(Schema.Finite),
  canShare: Loose(Schema.Boolean),
  commentCount: Loose(Schema.Finite),
  content: MlogContent,
  ipLocation: Loose(MlogIpLocation),
  liked: Loose(Schema.Boolean),
  likedCount: Loose(Schema.Finite),
  maxCommentShowNum: Loose(Schema.Finite),
  priorShowLive: Loose(Schema.Boolean),
  profile: Loose(MlogProfile),
  pubTime: Loose(Schema.Finite),
  shareCount: Loose(Schema.Finite),
  shareUrl: Loose(Schema.String),
  source: Loose(Schema.String),
  status: Loose(Schema.Finite),
  subed: Loose(Schema.Boolean),
  threadId: Loose(Schema.String),
  type: Loose(Schema.Finite),
  userId: Loose(Schema.Finite),
});

// 返回码、通到 mlog 记录的 `data` 和 `data.resource`、mlog 自己的编号 `data.id`/`data.resource.id`，
// 以及接口要拿的播放地址 `data.resource.content.video.urlInfo.url` 收紧；mlog 正文、作者和展示字段宽松。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    data: UpstreamObject({
      id: Schema.String,
      likeGuide: Loose(MlogLikeGuide),
      operate: Loose(MlogOperate),
      recmdType: Loose(Schema.Finite),
      resource: MlogResource,
      squareFeedType: Loose(Schema.Finite),
      type: Loose(Schema.String),
    }),
    message: Loose(Schema.String),
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

const mlogUrl: ModuleEffect<ModuleInput, ModuleBody> = (query, request) =>
  Effect.gen(function* () {
    const data = {
      id: query.id,
      resolution: query.res || 1080,
      type: 1,
    };
    const response = yield* request(
      buildApiRequestIntent(
        `/api/mlog/detail/v1`,
        data,
        createOption(query, 'weapi'),
      ),
    );
    const body = yield* decodeUpstreamBody('mlog_url', ModuleBody, response);
    return { ...toModuleResponse(response), body };
  });

/**
 * mlog链接
 */
export default mlogUrl;

export { decodeLegacyModuleInput as decodeModuleInput } from '../core/module-input.ts';

export type ModuleInput = LegacyModuleInput;
