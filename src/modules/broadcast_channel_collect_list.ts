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

export type ModuleInput = { limit?: NaturalValue };

const inputSchema = Schema.Struct({ limit: Schema.optional(NaturalValue) });

export const decodeModuleInput = (input: unknown) =>
  decodeInput(inputSchema, input);

export const moduleActions = {
  request: {
    profile: 'eapi',
    target: '/api/content/channel/collect/list',
    semantic: 'read',
    cache: 'none',
    retry: 'never',
  },
} as const satisfies ModuleActions;

// 只收紧返回码。`data` 在登录和匿名录制里都是空数组，元素类型没有证据，未声明并原样保留；
// 账号没有收藏频道是正常结果。
export const ModuleBody = /* @__PURE__ */ defineModuleBody(
  UpstreamObject({
    code: Schema.Literal(200),
    message: Loose(Schema.String),
  }),
);
export type ModuleBody = BodyType<typeof ModuleBody>;

const broadcastChannelCollectList: ModuleEffect<
  ModuleInput,
  ModuleBody,
  typeof moduleActions
> = (query, request) =>
  Effect.gen(function* () {
    const data = {
      contentType: 'BROADCAST',
      limit: query.limit || '99999',
      timeReverseOrder: 'true',
      startDate: '4762584922000',
    };
    const response = yield* request('request', { data });
    const body = yield* decodeUpstreamBody(
      'broadcast_channel_collect_list',
      ModuleBody,
      response,
    );
    return { ...toModuleResponse(response), body };
  });

/**
 * 广播电台 - 我的收藏
 */
export default broadcastChannelCollectList;
