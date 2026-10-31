import { Effect, Schema } from 'effect';

import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import {
  decodeUpstreamBody,
  Loose,
  UpstreamObject,
} from '../core/upstream-body.ts';
import { AvatarDetail, MlogSong } from '../core/upstream-schemas.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';

const MlogImage = UpstreamObject({
  height: Loose(Schema.Finite),
  imageUrl: Loose(Schema.String),
  picKey: Loose(Schema.String),
  width: Loose(Schema.Finite),
});

const MlogCoverDetail = UpstreamObject({
  horizontalCoverImage: Loose(MlogImage),
  verticalCoverImage: Loose(MlogImage),
});

const MlogUrlInfo = UpstreamObject({
  id: Loose(Schema.String),
  r: Loose(Schema.Finite),
  resolution: Loose(Schema.Finite),
  size: Loose(Schema.Finite),
  validityTime: Loose(Schema.Finite),
});

const MlogVideo = UpstreamObject({
  coverDetail: Loose(MlogCoverDetail),
  coverUrl: Loose(Schema.String),
  duration: Loose(Schema.Finite),
  frameImage: Loose(MlogImage),
  frameUrl: Loose(Schema.String),
  height: Loose(Schema.Finite),
  rcmdUrlInfo: Loose(MlogUrlInfo),
  urlInfo: Loose(MlogUrlInfo),
  urlInfos: Loose(Schema.Array(MlogUrlInfo)),
  videoKey: Loose(Schema.String),
  width: Loose(Schema.Finite),
});

const MlogUserProfile = UpstreamObject({
  avatarDetail: Loose(AvatarDetail),
  avatarUrl: Loose(Schema.String),
  followed: Loose(Schema.Boolean),
  isAnchor: Loose(Schema.Boolean),
  nickname: Loose(Schema.String),
  userId: Loose(Schema.Finite),
  userType: Loose(Schema.Finite),
});

const MlogMixInfo = UpstreamObject({
  status: Loose(Schema.Finite),
});

const MlogBaseData = UpstreamObject({
  coverColor: Loose(Schema.Finite),
  coverDetail: Loose(MlogCoverDetail),
  coverHeight: Loose(Schema.Finite),
  coverPicKey: Loose(Schema.String),
  coverUrl: Loose(Schema.String),
  coverWidth: Loose(Schema.Finite),
  desc: Loose(Schema.String),
  duration: Loose(Schema.Finite),
  greatCover: Loose(Schema.Boolean),
  id: Loose(Schema.String),
  mixInfo: Loose(MlogMixInfo),
  originalTitle: Loose(Schema.String),
  pubTime: Loose(Schema.Finite),
  text: Loose(Schema.String),
  threadId: Loose(Schema.String),
  type: Loose(Schema.Finite),
  userId: Loose(Schema.Finite),
  video: Loose(MlogVideo),
});

const MlogExtVo = UpstreamObject({
  canCollect: Loose(Schema.Boolean),
  commentCount: Loose(Schema.Finite),
  liked: Loose(Schema.Boolean),
  likedCount: Loose(Schema.Finite),
  playCount: Loose(Schema.Finite),
  shareCount: Loose(Schema.Finite),
  song: Loose(MlogSong),
});

const MlogResource = UpstreamObject({
  mlogBaseData: Loose(MlogBaseData),
  mlogExtVO: Loose(MlogExtVo),
  shareUrl: Loose(Schema.String),
  source: Loose(Schema.Finite),
  status: Loose(Schema.Finite),
  userProfile: Loose(MlogUserProfile),
});

// 视频条目：条目自己的 `id` 收紧，`resource` 是附带记录，整体宽松。
const MlogFeed = UpstreamObject({
  id: Schema.String,
  matchField: Loose(Schema.Finite),
  resource: Loose(MlogResource),
  sameCity: Loose(Schema.Boolean),
  type: Loose(Schema.Finite),
});

// 通到歌曲相关视频列表的 `data.feeds` 和每条记录自己的编号 `feeds[].id` 收紧；视频资源、
// 分页提示和 `message` 宽松，`data.msg` 只见过 null，未声明并原样保留。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    data: UpstreamObject({
      feeds: Schema.Array(MlogFeed),
      more: Loose(Schema.Boolean),
    }),
    message: Loose(Schema.String),
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

const mlogMusicRcmd: ModuleEffect<ModuleInput, ModuleBody> = (query, request) =>
  Effect.gen(function* () {
    const data = {
      id: query.mvid || 0,
      type: 2,
      rcmdType: 20,
      limit: query.limit || 10,
      extInfo: JSON.stringify({ songId: query.songid }),
    };
    const response = yield* request(
      buildApiRequestIntent(
        `/api/mlog/rcmd/feed/list`,
        data,
        createOption(query),
      ),
    );
    const body = yield* decodeUpstreamBody(
      'mlog_music_rcmd',
      ModuleBody,
      response,
    );
    return { ...toModuleResponse(response), body };
  });

/**
 * 歌曲相关视频
 */
export default mlogMusicRcmd;

export { decodeLegacyModuleInput as decodeModuleInput } from '../core/module-input.ts';

export type ModuleInput = LegacyModuleInput;
