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

// 返回码、收藏歌单列表的路径 `data.playlist` 和每个歌单自己的编号 `id` 收紧（复用 `PlaylistSummary`）；分页 `count`/`more` 和其余字段宽松。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    data: UpstreamObject({
      count: Loose(Schema.Finite),
      more: Loose(Schema.Boolean),
      playlist: Schema.Array(PlaylistSummary),
    }),
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

export const moduleActions = {
  read: {
    target: '/api/user/playlist/collect',
    profile: 'eapi',
    semantic: 'read',
    cache: 'none',
    retry: 'never',
  },
} as const satisfies ModuleActions;

export type ModuleInput = {
  uid: NumberId;
  limit?: number;
  offset?: number;
};

const inputSchema = Schema.Struct({
  uid: NumberId,
  limit: Schema.optional(NaturalValue),
  offset: Schema.optional(NaturalValue),
});

export const decodeModuleInput = (input: unknown) =>
  decodeInput(inputSchema, input);

const userPlaylistCollect: ModuleEffect<
  ModuleInput,
  ModuleBody,
  typeof moduleActions
> = (query, request) =>
  Effect.gen(function* () {
    const data = {
      limit: query.limit || '100',
      offset: query.offset || '0',
      userId: query.uid,
      isWebview: 'true',
      includeRedHeart: 'true',
      includeTop: 'true',
    };
    const response = yield* request('read', { data });
    const body = yield* decodeUpstreamBody(
      'user_playlist_collect',
      ModuleBody,
      response,
    );
    return { ...toModuleResponse(response), body };
  });

/**
 * 获取用户的收藏歌单列表
 */
export default userPlaylistCollect;
