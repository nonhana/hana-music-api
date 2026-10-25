import { Effect, Schema } from 'effect';

import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import {
  decodeUpstreamBody,
  Loose,
  UpstreamObject,
} from '../core/upstream-body.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';

const MlogAvatarDetail = UpstreamObject({
  identityIconUrl: Loose(Schema.String),
  identityLevel: Loose(Schema.Finite),
  userType: Loose(Schema.Finite),
});

const MlogUser = UpstreamObject({
  avatarDetail: Loose(MlogAvatarDetail),
  avatarUrl: Loose(Schema.String),
  followed: Loose(Schema.Boolean),
  nickname: Loose(Schema.String),
  userId: Loose(Schema.Finite),
  userType: Loose(Schema.Finite),
});

const MlogArtist = UpstreamObject({
  followed: Loose(Schema.Boolean),
  id: Loose(Schema.Finite),
  img1v1Url: Loose(Schema.String),
  mlogUser: Loose(MlogUser),
  name: Loose(Schema.String),
});

const MlogSongArtist = UpstreamObject({
  artistId: Loose(Schema.Finite),
  artistName: Loose(Schema.String),
});

const MlogSong = UpstreamObject({
  albumName: Loose(Schema.String),
  artists: Loose(Schema.Array(MlogSongArtist)),
  coverUrl: Loose(Schema.String),
  duration: Loose(Schema.Finite),
  id: Loose(Schema.Finite),
  name: Loose(Schema.String),
});

const MlogExtVo = UpstreamObject({
  artistName: Loose(Schema.String),
  artists: Loose(Schema.Array(MlogArtist)),
  canCollect: Loose(Schema.Boolean),
  collectReason: Loose(Schema.String),
  commentCount: Loose(Schema.Finite),
  liked: Loose(Schema.Boolean),
  likedCount: Loose(Schema.Finite),
  playCount: Loose(Schema.Finite),
  shareCount: Loose(Schema.Finite),
  song: Loose(MlogSong),
});

const MlogTagSign = UpstreamObject({
  br: Loose(Schema.Finite),
  tagSign: Loose(Schema.String),
  type: Loose(Schema.String),
});

const MlogVideo = UpstreamObject({
  check: Loose(Schema.Boolean),
  container: Loose(Schema.String),
  duration: Loose(Schema.Finite),
  height: Loose(Schema.Finite),
  md5: Loose(Schema.String),
  size: Loose(Schema.Finite),
  tag: Loose(Schema.String),
  tagSign: Loose(MlogTagSign),
  url: Loose(Schema.String),
  width: Loose(Schema.Finite),
});

const MlogBaseData = UpstreamObject({
  coverColor: Loose(Schema.Finite),
  coverHeight: Loose(Schema.Finite),
  coverPicKey: Loose(Schema.String),
  coverUrl: Loose(Schema.String),
  coverWidth: Loose(Schema.Finite),
  desc: Loose(Schema.String),
  duration: Loose(Schema.Finite),
  greatCover: Loose(Schema.Boolean),
  id: Loose(Schema.String),
  pubTime: Loose(Schema.Finite),
  text: Loose(Schema.String),
  threadId: Loose(Schema.String),
  type: Loose(Schema.Finite),
  videos: Loose(Schema.Array(MlogVideo)),
});

const MlogResource = UpstreamObject({
  mlogBaseData: Loose(MlogBaseData),
  mlogExtVO: Loose(MlogExtVo),
  shareUrl: Loose(Schema.String),
  status: Loose(Schema.Finite),
});

const VideoRecord = UpstreamObject({
  id: Schema.String,
  matchField: Loose(Schema.Finite),
  resource: Loose(MlogResource),
  sameCity: Loose(Schema.Boolean),
  type: Loose(Schema.Finite),
});

const VideoPage = UpstreamObject({
  cursor: Loose(Schema.String),
  more: Loose(Schema.Boolean),
  size: Loose(Schema.Finite),
});

// 通到视频列表的路径 `data.records` 和每条记录的编号 `records[].id` 收紧；分页游标和嵌套资源都是宽松字段。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    message: Loose(Schema.String),
    data: UpstreamObject({
      page: Loose(VideoPage),
      records: Schema.Array(VideoRecord),
    }),
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

const artistVideo: ModuleEffect<ModuleInput, ModuleBody> = (query, request) =>
  Effect.gen(function* () {
    const data = {
      artistId: query.id,
      page: JSON.stringify({
        size: query.size || 10,
        cursor: query.cursor || 0,
      }),
      tab: 0,
      order: query.order || 0,
    };
    const response = yield* request(
      buildApiRequestIntent(
        `/api/mlog/artist/video`,
        data,
        createOption(query, 'weapi'),
      ),
    );
    const body = yield* decodeUpstreamBody(
      'artist_video',
      ModuleBody,
      response,
    );
    return { ...toModuleResponse(response), body };
  });

/**
 * 歌手相关视频
 */
export default artistVideo;

export { decodeLegacyModuleInput as decodeModuleInput } from '../core/module-input.ts';

export type ModuleInput = LegacyModuleInput;
