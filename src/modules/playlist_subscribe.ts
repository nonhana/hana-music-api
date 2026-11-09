import { Effect, Schema } from 'effect';

import type { ModuleActions } from '../core/request-actions.ts';
import { toModuleResponse } from '../core/response.ts';
import { decodeUpstreamBody, UpstreamObject } from '../core/upstream-body.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';

// 接口只返回返回码，收紧的是返回码；`checkToken` 等失败正文按业务拒绝原样转交。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({ code: Schema.Literal(200) }),
);
export type ModuleBody = typeof ModuleBody.Type;

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
    const action = Number(query.t) === 1 ? 'subscribe' : 'unsubscribe';
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
export { decodeLegacyModuleInput as decodeModuleInput } from '../core/module-input.ts';

export type ModuleInput = LegacyModuleInput;
