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

export type ModuleInput = { ids: NumberIdList; pid: NumberId };

const inputSchema = Schema.Struct({
  ids: NumberIdList,
  pid: NumberId,
});

export const decodeModuleInput = (input: unknown) =>
  decodeInput(inputSchema, input);

// 接口只返回返回码，收紧的是返回码。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({ code: Schema.Literal(200) }),
);
export type ModuleBody = typeof ModuleBody.Type;

export const moduleActions = {
  update: {
    target: '/api/playlist/manipulate/tracks',
    profile: 'eapi',
    semantic: 'write',
    cache: 'none',
    retry: 'never',
  },
} as const satisfies ModuleActions;

const songOrderUpdate: ModuleEffect<
  ModuleInput,
  ModuleBody,
  typeof moduleActions
> = (query, request) =>
  Effect.gen(function* () {
    const data = {
      pid: query.pid,
      trackIds: JSON.stringify(query.ids.map(String)),
      op: 'update',
    };

    const response = yield* request('update', { data });
    return {
      ...toModuleResponse(response),
      body: yield* decodeUpstreamBody(
        'song_order_update',
        ModuleBody,
        response,
      ),
    };
  });

/**
 * 更新歌曲顺序
 */
export default songOrderUpdate;
