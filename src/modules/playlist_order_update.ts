import { Effect, Schema } from 'effect';

import type { ModuleActions } from '../core/request-actions.ts';
import { toModuleResponse } from '../core/response.ts';
import { decodeUpstreamBody, UpstreamObject } from '../core/upstream-body.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';

// 接口只返回返回码，收紧的是返回码。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({ code: Schema.Literal(200) }),
);
export type ModuleBody = typeof ModuleBody.Type;

export const moduleActions = {
  update: {
    target: '/api/playlist/order/update',
    profile: 'web',
    semantic: 'write',
    cache: 'none',
    retry: 'never',
  },
} as const satisfies ModuleActions;

const playlistOrderUpdate: ModuleEffect<
  ModuleInput,
  ModuleBody,
  typeof moduleActions
> = (query, request) =>
  Effect.gen(function* () {
    const data = {
      ids: query.ids,
    };
    const response = yield* request('update', { data });
    return {
      ...toModuleResponse(response),
      body: yield* decodeUpstreamBody(
        'playlist_order_update',
        ModuleBody,
        response,
      ),
    };
  });

/**
 * 编辑歌单顺序
 */
export default playlistOrderUpdate;

export { decodeLegacyModuleInput as decodeModuleInput } from '../core/module-input.ts';

export type ModuleInput = LegacyModuleInput;
