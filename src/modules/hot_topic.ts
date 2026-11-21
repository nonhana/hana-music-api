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
import type { ModuleEffect } from '../types/index.ts';

export type ModuleInput = { limit?: NaturalValue; offset?: NaturalValue };

const inputSchema = Schema.Struct({
  limit: Schema.optional(NaturalValue),
  offset: Schema.optional(NaturalValue),
});

export const decodeModuleInput = (input: unknown) =>
  decodeInput(inputSchema, input);

export const moduleActions = {
  request: {
    profile: 'web',
    target: '/api/act/hot',
    semantic: 'read',
    cache: 'none',
    retry: 'connect',
  },
} as const satisfies ModuleActions;

// 话题记录的编号是 `actId`；标题、正文、参与人数和封面都是宽松字段。
const HotTopicRecord = UpstreamObject({
  actId: Schema.Finite,
  alg: Loose(Schema.String),
  isDefaultImg: Loose(Schema.Boolean),
  participateCount: Loose(Schema.Finite),
  reason: Loose(Schema.String),
  sharePicUrl: Loose(Schema.String),
  text: Schema.String.pipe(Schema.Array, Loose),
  title: Loose(Schema.String),
});

// 获取热门话题：通到列表的路径 `hot` 和每条话题自己的编号 `hot[].actId` 收紧；空推荐位未见录制，`hot: []` 由契约测试覆盖。
export const ModuleBody = /* @__PURE__ */ defineModuleBody(
  UpstreamObject({
    code: Schema.Literal(200),
    hot: Schema.Array(HotTopicRecord),
  }),
);
export type ModuleBody = BodyType<typeof ModuleBody>;

const hotTopic: ModuleEffect<ModuleInput, ModuleBody, typeof moduleActions> = (
  query,
  request,
) =>
  Effect.gen(function* () {
    const data = {
      limit: query.limit || 20,
      offset: query.offset || 0,
    };
    const response = yield* request('request', { data });
    const body = yield* decodeUpstreamBody('hot_topic', ModuleBody, response);
    return { ...toModuleResponse(response), body };
  });

/**
 * 热门话题
 */
export default hotTopic;
