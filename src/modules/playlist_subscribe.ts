import { Effect, Schema } from 'effect';

import {
  decodeModuleInput as decodeInput,
  NumberId,
  NumberLiterals,
} from '../core/module-input.ts';
import type { ModuleActions } from '../core/request-actions.ts';
import { toModuleResponse } from '../core/response.ts';
import { decodeUpstreamBody, UpstreamObject } from '../core/upstream-body.ts';
import type { ModuleEffect } from '../types/index.ts';

// 接口只返回返回码，收紧的是返回码；`checkToken` 等失败正文按业务拒绝原样转交。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({ code: Schema.Literal(200) }),
);
export type ModuleBody = typeof ModuleBody.Type;

// 文档写 t=2 取消收藏，历史录制和旧客户端用 t=0；两者都表示取消，其他值拒绝。
export type ModuleInput = {
  id: NumberId;
  t: 0 | 1 | 2;
};

const inputSchema = Schema.Struct({
  id: NumberId,
  t: NumberLiterals([0, 1, 2]),
});

export const decodeModuleInput = (input: unknown) =>
  decodeInput(inputSchema, input);

export const moduleActions = {
  subscribe: {
    target: '/api/playlist/subscribe',
    profile: 'web',
    semantic: 'write',
    cache: 'none',
    retry: 'never',
  },
  unsubscribe: {
    target: '/api/playlist/unsubscribe',
    profile: 'web',
    semantic: 'write',
    cache: 'none',
    retry: 'never',
  },
} as const satisfies ModuleActions;

const playlistSubscribe: ModuleEffect<
  ModuleInput,
  ModuleBody,
  typeof moduleActions
> = (query, request) =>
  Effect.gen(function* () {
    const action = query.t === 1 ? 'subscribe' : 'unsubscribe';
    const response = yield* request(action, { data: { id: query.id } });

    return {
      ...toModuleResponse(response),
      body: yield* decodeUpstreamBody(
        'playlist_subscribe',
        ModuleBody,
        response,
      ),
    };
  });

export default playlistSubscribe;
