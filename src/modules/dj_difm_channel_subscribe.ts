import { Effect, Schema } from 'effect';

import type { ModuleActions } from '../core/request-actions.ts';
import { toModuleResponse } from '../core/response.ts';
import {
  decodeUpstreamBody,
  Loose,
  UpstreamObject,
} from '../core/upstream-body.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';

export const moduleActions = {
  request: {
    profile: 'eapi',
    target: '/api/dj/difm/channel/subscribe',
    semantic: 'write',
    cache: 'none',
    retry: 'never',
  },
} as const satisfies ModuleActions;

// 接口就是为了确认收藏频道成功：正文顶层返回码 `code` 收紧；`message` 是附带提示，宽松
// （`data` 在正向和重复收藏的录制里都只有空对象，内部字段没有证据，未声明并原样保留）。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    message: Loose(Schema.String),
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

const djDifmChannelSubscribe: ModuleEffect<
  ModuleInput,
  ModuleBody,
  typeof moduleActions
> = (query, request) =>
  Effect.gen(function* () {
    const data = {
      id: query.id,
    };
    const response = yield* request('request', { data });
    return {
      ...toModuleResponse(response),
      body: yield* decodeUpstreamBody(
        'dj_difm_channel_subscribe',
        ModuleBody,
        response,
      ),
    };
  });

/**
 * DIFM电台 - 收藏频道
 */
export default djDifmChannelSubscribe;

export { decodeLegacyModuleInput as decodeModuleInput } from '../core/module-input.ts';

export type ModuleInput = LegacyModuleInput;
