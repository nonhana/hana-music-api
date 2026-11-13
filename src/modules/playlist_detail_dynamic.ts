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
import type { ModuleEffect } from '../types/index.ts';

// 接口就是为了拿这张歌单的评论数、收藏数、播放数和分享数，正文没有要收紧的路径，只有返回码收紧；其余字段宽松。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    bookedCount: Loose(Schema.Finite),
    commentCount: Loose(Schema.Finite),
    followed: Loose(Schema.Boolean),
    gradeStatus: Loose(Schema.String),
    playCount: Loose(Schema.Finite),
    shareCount: Loose(Schema.Finite),
    subscribed: Loose(Schema.Boolean),
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

export type ModuleInput = {
  id: NumberId;
  s?: number;
};

const inputSchema = Schema.Struct({
  id: NumberId,
  s: Schema.optional(NaturalValue),
});

export const decodeModuleInput = (input: unknown) =>
  decodeInput(inputSchema, input);

export const moduleActions = {
  read: {
    target: '/api/playlist/detail/dynamic',
    profile: 'web',
    semantic: 'read',
    cache: 'none',
    retry: 'read',
  },
} as const satisfies ModuleActions;

const playlistDetailDynamic: ModuleEffect<
  ModuleInput,
  ModuleBody,
  typeof moduleActions
> = (query, request) =>
  Effect.gen(function* () {
    const data = {
      id: query.id,
      n: 100000,
      s: query.s || 8,
    };
    const response = yield* request('read', { data });
    const body = yield* decodeUpstreamBody(
      'playlist_detail_dynamic',
      ModuleBody,
      response,
    );
    return { ...toModuleResponse(response), body };
  });

/**
 * 歌单动态信息
 */
export default playlistDetailDynamic;
