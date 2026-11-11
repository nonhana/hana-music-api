import { Effect, Schema } from 'effect';

import {
  decodeModuleInput as decodeInput,
  NumberLiterals,
} from '../core/module-input.ts';
import type { ModuleActions } from '../core/request-actions.ts';
import { toModuleResponse } from '../core/response.ts';
import {
  decodeUpstreamBody,
  Loose,
  UpstreamObject,
} from '../core/upstream-body.ts';
import type { ModuleEffect } from '../types/index.ts';

export type ModuleInput = { sources?: ReadonlyArray<0 | 1 | 2> };

const inputSchema = Schema.Struct({
  sources: Schema.optional(Schema.Array(NumberLiterals([0, 1, 2]))),
});

export const decodeModuleInput = (input: unknown) =>
  decodeInput(inputSchema, input);

export const moduleActions = {
  request: {
    profile: 'eapi',
    target: '/api/dj/difm/subscribe/channels/get/v2',
    semantic: 'read',
    cache: 'none',
    retry: 'never',
  },
} as const satisfies ModuleActions;

// 只收紧返回码。`data` 在匿名、登录和 `sources` 的 `[0]`/`[1]` 探测里都是空数组，元素类型没有证据，
// 未声明并原样保留；账号的收藏频道为空是正常结果。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    message: Loose(Schema.String),
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

const djDifmSubscribeChannelsGet: ModuleEffect<
  ModuleInput,
  ModuleBody,
  typeof moduleActions
> = (query, request) =>
  Effect.gen(function* () {
    const data = {
      sources: JSON.stringify(query.sources ?? [0]),
    };
    const response = yield* request('request', { data });
    const body = yield* decodeUpstreamBody(
      'dj_difm_subscribe_channels_get',
      ModuleBody,
      response,
    );
    return { ...toModuleResponse(response), body };
  });

/**
 * DIFM电台 - 收藏列表
 */
export default djDifmSubscribeChannelsGet;
