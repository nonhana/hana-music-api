import * as Effect from 'effect/Effect';
import * as Schema from 'effect/Schema';

import {
  decodeModuleInput as decodeInput,
  EmptyInput,
} from '../core/module-input.ts';
import type { NoInput } from '../core/module-input.ts';
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

export type ModuleInput = NoInput;

const inputSchema = EmptyInput;

export const decodeModuleInput = (input: unknown) =>
  decodeInput(inputSchema, input).pipe(Effect.as({}));

const HotSearchDetail = UpstreamObject({
  searchWord: Schema.String,
  alg: Loose(Schema.String),
  score: Loose(Schema.Finite),
  content: Loose(Schema.String),
  source: Loose(Schema.Finite),
  iconType: Loose(Schema.Finite),
  iconUrl: Loose(Schema.String),
  url: Loose(Schema.String),
});

// 通到热搜详情列表的路径 `data`；每条记录的 `searchWord` 是热搜词，是接口要返回的那一项。
export const ModuleBody = /* @__PURE__ */ defineModuleBody(
  UpstreamObject({
    code: Schema.Literal(200),
    data: Schema.Array(HotSearchDetail),
    message: Loose(Schema.String),
    trp: Loose(
      UpstreamObject({ rules: Schema.String.pipe(Schema.Array, Loose) }),
    ),
  }),
);
export type ModuleBody = BodyType<typeof ModuleBody>;

export const moduleActions = {
  read: {
    target: '/api/hotsearchlist/get',
    profile: 'web',
    semantic: 'read',
    cache: 'none',
    retry: 'connect',
  },
} as const satisfies ModuleActions;

const searchHotDetail: ModuleEffect<
  ModuleInput,
  ModuleBody,
  typeof moduleActions
> = (_query, request) =>
  Effect.gen(function* () {
    const data = {};
    const response = yield* request('read', { data });
    const body = yield* decodeUpstreamBody(
      'search_hot_detail',
      ModuleBody,
      response,
    );
    return { ...toModuleResponse(response), body };
  });

/**
 * 热搜列表
 */
export default searchHotDetail;
