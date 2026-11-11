import { Effect, Schema } from 'effect';

import {
  decodeModuleInput as decodeInput,
  NaturalValue,
  NumberId,
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

export type ModuleInput = {
  id: NumberId;
  limit?: NaturalValue;
  offset?: NaturalValue;
};

const inputSchema = Schema.Struct({
  id: NumberId,
  limit: Schema.optional(NaturalValue),
  offset: Schema.optional(NaturalValue),
});

export const decodeModuleInput = (input: unknown) =>
  decodeInput(inputSchema, input);

const PlaylistExtInfo = UpstreamObject({
  coverImgId_str: Loose(Schema.String),
});

// 相似歌单记录复用 `PlaylistSummary`，另声明录制里非 null 的推荐字段；只见过 null 的字段未声明。
const SimiPlaylist = UpstreamObject({
  ...PlaylistSummary.schema.fields,
  alg: Loose(Schema.String),
  backgroundImageId: Loose(Schema.Finite),
  extProperties: Loose(PlaylistExtInfo),
  originalCoverId: Loose(Schema.Finite),
  recommendReason: Loose(Schema.String),
  tsSongCount: Loose(Schema.Finite),
  xInfo: Loose(PlaylistExtInfo),
});

// 通到相似歌单列表的路径 `playlists` 和每个歌单的编号收紧（复用 `SimiPlaylist`）；其余字段宽松。
// 缺少 `id` 时上游 HTTP 400 被归一成 `status: 200` 和空正文，空字符串作为独立分支声明。
export const ModuleBody = Schema.toStandardSchemaV1(
  Schema.Union([
    UpstreamObject({
      code: Schema.Literal(200),
      playlists: Schema.Array(SimiPlaylist),
    }),
    Schema.Literal(''),
  ]).annotate({ expected: 'object with code 200 or an empty string' }),
);
export type ModuleBody = typeof ModuleBody.Type;

export const moduleActions = {
  read: {
    target: '/api/discovery/simiPlaylist',
    profile: 'web',
    semantic: 'read',
    cache: 'none',
    retry: 'connect',
  },
} as const satisfies ModuleActions;

const simiPlaylist: ModuleEffect<
  ModuleInput,
  ModuleBody,
  typeof moduleActions
> = (query, request) =>
  Effect.gen(function* () {
    const data = {
      songid: query.id,
      limit: query.limit || 50,
      offset: query.offset || 0,
    };
    const response = yield* request('read', { data });
    const body = yield* decodeUpstreamBody(
      'simi_playlist',
      ModuleBody,
      response,
    );
    return { ...toModuleResponse(response), body };
  });

/**
 * 相似歌单
 */
export default simiPlaylist;
