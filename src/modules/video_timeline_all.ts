import { Effect, Schema } from 'effect';

import type { ModuleActions } from '../core/request-actions.ts';
import { toModuleResponse } from '../core/response.ts';
import {
  decodeUpstreamBody,
  Loose,
  UpstreamObject,
} from '../core/upstream-body.ts';
import {
  LooseSong,
  PlaylistUser,
  VideoGroupRef,
  VideoResolutionEntry,
} from '../core/upstream-schemas.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';

export const moduleActions = {
  request: {
    profile: 'web',
    target: '/api/videotimeline/otherclient/get',
    semantic: 'read',
    cache: 'none',
    retry: 'never',
  },
} as const satisfies ModuleActions;

const TimelineVideo = UpstreamObject({
  vid: Schema.String,
  alg: Loose(Schema.String),
  commentCount: Loose(Schema.Finite),
  coverUrl: Loose(Schema.String),
  creator: Loose(PlaylistUser),
  description: Loose(Schema.String),
  durationms: Loose(Schema.Finite),
  hasRelatedGameAd: Loose(Schema.Boolean),
  height: Loose(Schema.Finite),
  markTypes: Loose(Schema.Array(Schema.Finite)),
  playTime: Loose(Schema.Finite),
  praised: Loose(Schema.Boolean),
  praisedCount: Loose(Schema.Finite),
  previewDurationms: Loose(Schema.Finite),
  previewUrl: Loose(Schema.String),
  relateSong: Loose(Schema.Array(LooseSong)),
  resolutions: Loose(Schema.Array(VideoResolutionEntry)),
  scm: Loose(Schema.String),
  shareCount: Loose(Schema.Finite),
  subscribed: Loose(Schema.Boolean),
  threadId: Loose(Schema.String),
  title: Loose(Schema.String),
  videoGroup: Loose(Schema.Array(VideoGroupRef)),
  width: Loose(Schema.Finite),
});

const TimelineEntry = UpstreamObject({
  alg: Loose(Schema.String),
  data: TimelineVideo,
  displayed: Loose(Schema.Boolean),
  type: Loose(Schema.Finite),
});

// 通到全部视频列表的路径 `datas` 和每条视频的编号 `datas[].data.vid` 收紧；`extAlg`、`relatedInfo`、`urlInfo`、`videoUserLiveInfo` 只见过 null，未声明。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    datas: Schema.Array(TimelineEntry),
    hasmore: Loose(Schema.Boolean),
    msg: Loose(Schema.String),
    rcmdLimit: Loose(Schema.Finite),
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

const videoTimelineAll: ModuleEffect<
  ModuleInput,
  ModuleBody,
  typeof moduleActions
> = (query, request) =>
  Effect.gen(function* () {
    const data = {
      groupId: 0,
      offset: query.offset || 0,
      need_preview_url: 'true',
      total: true,
    };
    const response = yield* request('request', { data });
    const body = yield* decodeUpstreamBody(
      'video_timeline_all',
      ModuleBody,
      response,
    );
    return { ...toModuleResponse(response), body };
  });

/**
 * 全部视频列表
 */
export default videoTimelineAll;

export { decodeLegacyModuleInput as decodeModuleInput } from '../core/module-input.ts';

export type ModuleInput = LegacyModuleInput;
