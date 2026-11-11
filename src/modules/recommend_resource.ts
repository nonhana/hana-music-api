import { Effect, Schema } from 'effect';

import {
  decodeModuleInput as decodeInput,
  EmptyInput,
} from '../core/module-input.ts';
import type { NoInput } from '../core/module-input.ts';
import type { ModuleActions } from '../core/request-actions.ts';
import { toModuleResponse } from '../core/response.ts';
import {
  decodeUpstreamBody,
  Loose,
  UpstreamObject,
} from '../core/upstream-body.ts';
import { PlaylistSummary } from '../core/upstream-schemas.ts';
import type { ModuleEffect } from '../types/index.ts';

export type ModuleInput = NoInput;

const inputSchema = EmptyInput;

export const decodeModuleInput = (input: unknown) =>
  decodeInput(inputSchema, input).pipe(Effect.as({}));

// 每日推荐歌单复用 `PlaylistSummary`，另声明录制里非 null 的推荐卡片字段（`playcount` 是小写）。
const RecommendedPlaylist = UpstreamObject({
  ...PlaylistSummary.schema.fields,
  alg: Loose(Schema.String),
  copywriter: Loose(Schema.String),
  picUrl: Loose(Schema.String),
  playcount: Loose(Schema.Finite),
  type: Loose(Schema.Finite),
});

// 通到每日推荐歌单的路径 `recommend` 和每个歌单自己的编号 `recommend[].id` 收紧（共用 `PlaylistSummary`）；其余字段宽松。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    recommend: Schema.Array(RecommendedPlaylist),
    featureFirst: Loose(Schema.Boolean),
    haveRcmdSongs: Loose(Schema.Boolean),
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

export const moduleActions = {
  read: {
    target: '/api/v1/discovery/recommend/resource',
    profile: 'web',
    semantic: 'read',
    cache: 'none',
    retry: 'connect',
  },
} as const satisfies ModuleActions;

const recommendResource: ModuleEffect<
  ModuleInput,
  ModuleBody,
  typeof moduleActions
> = (_query, request) =>
  Effect.gen(function* () {
    const response = yield* request('read', { data: {} });
    const body = yield* decodeUpstreamBody(
      'recommend_resource',
      ModuleBody,
      response,
    );
    return { ...toModuleResponse(response), body };
  });

/**
 * 每日推荐歌单
 */
export default recommendResource;
