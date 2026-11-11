import { Effect, Schema } from 'effect';

import {
  decodeModuleInput as decodeInput,
  NumberId,
  NumberIdList,
} from '../core/module-input.ts';
import type { ModuleActions } from '../core/request-actions.ts';
import { toModuleResponse } from '../core/response.ts';
import { decodeUpstreamBody, UpstreamObject } from '../core/upstream-body.ts';
import type { ModuleEffect } from '../types/index.ts';

// 接口只返回返回码，收紧的是返回码。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({ code: Schema.Literal(200) }),
);
export type ModuleBody = typeof ModuleBody.Type;

export type ModuleInput = { id: NumberId | NumberIdList };

const inputSchema = Schema.Struct({
  id: Schema.Union([NumberId, NumberIdList]),
});

export const decodeModuleInput = (input: unknown) =>
  decodeInput(inputSchema, input);

export const moduleActions = {
  remove: {
    target: '/api/playlist/remove',
    profile: 'web',
    semantic: 'write',
    cache: 'none',
    retry: 'never',
  },
} as const satisfies ModuleActions;

const playlistDelete: ModuleEffect<
  ModuleInput,
  ModuleBody,
  typeof moduleActions
> = (query, request) =>
  Effect.gen(function* () {
    const ids = Array.isArray(query.id) ? query.id : [query.id];
    const data = {
      ids: '[' + ids.map(String).join(',') + ']',
    };
    const response = yield* request('remove', { data });
    return {
      ...toModuleResponse(response),
      body: yield* decodeUpstreamBody('playlist_delete', ModuleBody, response),
    };
  });

/**
 * 删除歌单
 */
export default playlistDelete;
