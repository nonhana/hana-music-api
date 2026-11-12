import { Effect, Schema } from 'effect';

import {
  decodeModuleInput as decodeInput,
  NaturalValue,
} from '../core/module-input.ts';
import type { ModuleActions } from '../core/request-actions.ts';
import { toModuleResponse } from '../core/response.ts';
import {
  decodeUpstreamBody,
  Loose,
  UpstreamObject,
} from '../core/upstream-body.ts';
import { PlaylistSummary } from '../core/upstream-schemas.ts';
import type { ModuleEffect } from '../types/index.ts';

// 文档只支持 `limit`，不支持 `offset`；省略时仍取 30。
export type ModuleInput = { limit?: NaturalValue };

const inputSchema = Schema.Struct({
  limit: Schema.optional(NaturalValue),
});

export const decodeModuleInput = (input: unknown) =>
  decodeInput(inputSchema, input);

// 推荐歌单卡片的字段比 `PlaylistSummary` 少（没有 `creator`、`subscribed` 等），卡片特有字段另声明。
const RecommendedPlaylist = UpstreamObject({
  ...PlaylistSummary.schema.fields,
  alg: Loose(Schema.String),
  canDislike: Loose(Schema.Boolean),
  copywriter: Loose(Schema.String),
  picUrl: Loose(Schema.String),
  type: Loose(Schema.Finite),
});

// 通到推荐歌单的路径 `result` 和每个歌单自己的编号 `result[].id` 收紧（共用 `PlaylistSummary`）；`category`、`hasTaste` 和卡片其余字段宽松。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    result: Schema.Array(RecommendedPlaylist),
    category: Loose(Schema.Finite),
    hasTaste: Loose(Schema.Boolean),
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

export const moduleActions = {
  read: {
    target: '/api/personalized/playlist',
    profile: 'web',
    semantic: 'read',
    cache: 'none',
    retry: 'connect',
  },
} as const satisfies ModuleActions;

const personalized: ModuleEffect<
  ModuleInput,
  ModuleBody,
  typeof moduleActions
> = (query, request) =>
  Effect.gen(function* () {
    const data = {
      limit: query.limit || 30,
      total: true,
      n: 1000,
    };
    const response = yield* request('read', { data });
    const body = yield* decodeUpstreamBody(
      'personalized',
      ModuleBody,
      response,
    );
    return { ...toModuleResponse(response), body };
  });

/**
 * 推荐歌单
 */
export default personalized;
