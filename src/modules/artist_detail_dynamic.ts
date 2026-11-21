import * as Effect from 'effect/Effect';
import * as Schema from 'effect/Schema';

import {
  decodeModuleInput as decodeInput,
  NumberId,
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
import type { ModuleEffect } from '../types/index.ts';

export type ModuleInput = { id: NumberId };

const inputSchema = Schema.Struct({
  id: NumberId,
});

export const decodeModuleInput = (input: unknown) =>
  decodeInput(inputSchema, input);

const Concert = UpstreamObject({
  onlineCount: Loose(Schema.Finite),
  view: Loose(Schema.Boolean),
});

const VideoNum = UpstreamObject({
  cat: Loose(Schema.Finite),
  num: Loose(Schema.Finite),
});

const RcmdResource = UpstreamObject({
  buttonName: Loose(Schema.String),
  description: Loose(Schema.String),
  resourceType: Loose(Schema.Finite),
  title: Loose(Schema.String),
  url: Loose(Schema.String),
});

// 只有返回码收紧；关注状态、演出、视频数和推荐资源都是宽松字段。
export const ModuleBody = /* @__PURE__ */ defineModuleBody(
  UpstreamObject({
    code: Schema.Literal(200),
    concert: Loose(Concert),
    followed: Loose(Schema.Boolean),
    rcmdResource: Loose(RcmdResource),
    videoNum: VideoNum.pipe(Schema.Array, Loose),
  }),
);
export type ModuleBody = BodyType<typeof ModuleBody>;

export const moduleActions = {
  read: {
    target: '/api/artist/detail/dynamic',
    profile: 'web',
    semantic: 'read',
    cache: 'none',
    retry: 'connect',
  },
} as const satisfies ModuleActions;

const artistDetailDynamic: ModuleEffect<
  ModuleInput,
  ModuleBody,
  typeof moduleActions
> = (query, request) =>
  Effect.gen(function* () {
    const data = {
      id: query.id,
    };
    const response = yield* request('read', { data });
    const body = yield* decodeUpstreamBody(
      'artist_detail_dynamic',
      ModuleBody,
      response,
    );
    return { ...toModuleResponse(response), body };
  });

/**
 * 歌手动态信息
 */
export default artistDetailDynamic;
