import { Effect, Schema } from 'effect';

import {
  decodeModuleInput as decodeInput,
  NumberId,
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

export type ModuleInput = {
  id: NumberId;
  name: string;
};

const inputSchema = Schema.Struct({
  id: NumberId,
  name: Schema.String,
});

export const decodeModuleInput = (input: unknown) =>
  decodeInput(inputSchema, input);

export const moduleActions = {
  update: {
    target: '/api/playlist/update/name',
    profile: 'web',
    semantic: 'write',
    cache: 'none',
    retry: 'never',
  },
} as const satisfies ModuleActions;

const playlistNameUpdate: ModuleEffect<
  ModuleInput,
  ModuleBody,
  typeof moduleActions
> = (query, request) =>
  Effect.gen(function* () {
    const data = {
      id: query.id,
      name: query.name,
    };
    const response = yield* request('update', { data });
    return {
      ...toModuleResponse(response),
      body: yield* decodeUpstreamBody(
        'playlist_name_update',
        ModuleBody,
        response,
      ),
    };
  });

/**
 * 更新歌单名
 */
export default playlistNameUpdate;
