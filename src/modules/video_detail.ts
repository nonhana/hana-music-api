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
  PlaylistUser,
  VideoGroupRef,
  VideoResolutionEntry,
} from '../core/upstream-schemas.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';

const VideoDetail = UpstreamObject({
  vid: Schema.String,
  advertisement: Loose(Schema.Boolean),
  authType: Loose(Schema.Finite),
  avatarUrl: Loose(Schema.String),
  commentCount: Loose(Schema.Finite),
  coverUrl: Loose(Schema.String),
  creator: Loose(PlaylistUser),
  description: Loose(Schema.String),
  durationms: Loose(Schema.Finite),
  hasRelatedGameAd: Loose(Schema.Boolean),
  height: Loose(Schema.Finite),
  playTime: Loose(Schema.Finite),
  praisedCount: Loose(Schema.Finite),
  publishTime: Loose(Schema.Finite),
  resolutions: Loose(Schema.Array(VideoResolutionEntry)),
  shareCount: Loose(Schema.Finite),
  subscribeCount: Loose(Schema.Finite),
  threadId: Loose(Schema.String),
  title: Loose(Schema.String),
  videoGroup: Loose(Schema.Array(VideoGroupRef)),
  width: Loose(Schema.Finite),
});

// 通到视频详情的路径 `data` 和视频自己的编号 `data.vid` 收紧；`markTypes`（只见过空数组）和 `videoUserLiveInfo`（只见过 null）未声明。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    message: Loose(Schema.String),
    data: VideoDetail,
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

const videoDetail: ModuleEffect<ModuleInput, ModuleBody> = (query, request) =>
  Effect.gen(function* () {
    const data = {
      id: query.id,
    };
    const response = yield* request(
      buildApiRequestIntent(
        `/api/cloudvideo/v1/video/detail`,
        data,
        createOption(query, 'weapi'),
      ),
    );
    const body = yield* decodeUpstreamBody(
      'video_detail',
      ModuleBody,
      response,
    );
    return { ...toModuleResponse(response), body };
  });

/**
 * 视频详情
 */
export default videoDetail;

export { decodeLegacyModuleInput as decodeModuleInput } from '../core/module-input.ts';

export type ModuleInput = LegacyModuleInput;
