import { Effect, Schema } from 'effect';

import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import {
  decodeUpstreamBody,
  Loose,
  UpstreamObject,
} from '../core/upstream-body.ts';
import { MlogSong } from '../core/upstream-schemas.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';

const VideoStream = UpstreamObject({
  tag: Loose(Schema.String),
  url: Loose(Schema.String),
  duration: Loose(Schema.Finite),
  size: Loose(Schema.Finite),
  width: Loose(Schema.Finite),
  height: Loose(Schema.Finite),
  container: Loose(Schema.String),
  md5: Loose(Schema.String),
  check: Loose(Schema.Boolean),
  tagSign: Loose(
    UpstreamObject({
      br: Loose(Schema.Finite),
      type: Loose(Schema.String),
      tagSign: Loose(Schema.String),
    }),
  ),
});

const MlogBaseData = UpstreamObject({
  id: Schema.String,
  threadId: Loose(Schema.String),
  type: Loose(Schema.Finite),
  text: Loose(Schema.String),
  desc: Loose(Schema.String),
  pubTime: Loose(Schema.Finite),
  coverUrl: Loose(Schema.String),
  coverPicKey: Loose(Schema.String),
  coverColor: Loose(Schema.Finite),
  coverHeight: Loose(Schema.Finite),
  coverWidth: Loose(Schema.Finite),
  duration: Loose(Schema.Finite),
  greatCover: Loose(Schema.Boolean),
  videos: Loose(Schema.Array(VideoStream)),
});

const MlogArtist = UpstreamObject({
  id: Loose(Schema.Finite),
  name: Loose(Schema.String),
  img1v1Url: Loose(Schema.String),
});

const MlogExtVO = UpstreamObject({
  artistName: Loose(Schema.String),
  artists: Loose(Schema.Array(MlogArtist)),
  canCollect: Loose(Schema.Boolean),
  commentCount: Loose(Schema.Finite),
  likedCount: Loose(Schema.Finite),
  playCount: Loose(Schema.Finite),
  song: Loose(MlogSong),
});

const RecentVideo = UpstreamObject({
  mlogBaseData: MlogBaseData,
  mlogExtVO: Loose(MlogExtVO),
  status: Loose(Schema.Finite),
  shareUrl: Loose(Schema.String),
});

// 通到最近播放视频列表的路径 `data.videos` 和每段视频自己的编号 `mlogBaseData.id` 收紧；其余字段宽松，只见过 `null` 的字段没有声明。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    message: Loose(Schema.String),
    data: UpstreamObject({
      videos: Schema.Array(RecentVideo),
    }),
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

const playlistVideoRecent: ModuleEffect<ModuleInput, ModuleBody> = (
  query,
  request,
) =>
  Effect.gen(function* () {
    const response = yield* request(
      buildApiRequestIntent(
        `/api/playlist/video/recent`,
        {},
        createOption(query, 'weapi'),
      ),
    );
    const body = yield* decodeUpstreamBody(
      'playlist_video_recent',
      ModuleBody,
      response,
    );
    return { ...toModuleResponse(response), body };
  });

/**
 * 最近播放的视频
 */
export default playlistVideoRecent;

export { decodeLegacyModuleInput as decodeModuleInput } from '../core/module-input.ts';

export type ModuleInput = LegacyModuleInput;
