import * as Effect from 'effect/Effect';
import * as Schema from 'effect/Schema';

import {
  decodeModuleInput as decodeInput,
  NaturalValue,
} from '../core/module-input.ts';
import type { ModuleActions } from '../core/request-actions.ts';
import { toModuleResponse } from '../core/response.ts';
import type { BodyType } from '../core/upstream-body.ts';
import {
  decodeUpstreamBody,
  defineModuleBody,
  Loose,
  UpstreamObject,
} from '../core/upstream-body.ts';
import { Artist } from '../core/upstream-schemas.ts';
import type { ModuleEffect } from '../types/index.ts';

export type ModuleInput = { limit?: number; offset?: number };

const inputSchema = Schema.Struct({
  limit: Schema.optional(NaturalValue),
  offset: Schema.optional(NaturalValue),
});

export const decodeModuleInput = (input: unknown) =>
  decodeInput(inputSchema, input);

const SubscribedAlbum = UpstreamObject({
  id: Schema.Finite,
  name: Loose(Schema.String),
  picUrl: Loose(Schema.String),
  size: Loose(Schema.Finite),
  artists: Artist.pipe(Schema.Array, Loose),
  alias: Schema.String.pipe(Schema.Array, Loose),
  picId: Loose(Schema.Finite),
  subTime: Loose(Schema.Finite),
  transNames: Schema.String.pipe(Schema.Array, Loose),
});

// 通到收藏列表的路径、每张唱片的编号收紧；其余字段宽松。
export const ModuleBody = /* @__PURE__ */ defineModuleBody(
  UpstreamObject({
    code: Schema.Literal(200),
    data: Schema.Array(SubscribedAlbum),
    hasMore: Loose(Schema.Boolean),
    count: Loose(Schema.Finite),
    paidCount: Loose(Schema.Finite),
  }),
);
export type ModuleBody = BodyType<typeof ModuleBody>;

export const moduleActions = {
  read: {
    target: '/api/album/sublist',
    profile: 'web',
    semantic: 'read',
    cache: 'none',
    retry: 'connect',
  },
} as const satisfies ModuleActions;

const albumSublist: ModuleEffect<
  ModuleInput,
  ModuleBody,
  typeof moduleActions
> = (query, request) =>
  Effect.gen(function* () {
    const data = {
      limit: query.limit || 25,
      offset: query.offset || 0,
      total: true,
    };
    const response = yield* request('read', { data });
    const body = yield* decodeUpstreamBody(
      'album_sublist',
      ModuleBody,
      response,
    );
    return {
      ...toModuleResponse(response),
      body,
    };
  });

/**
 * 已收藏专辑列表
 */
export default albumSublist;
