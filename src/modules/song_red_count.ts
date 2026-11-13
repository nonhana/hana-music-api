import { Effect, Schema } from 'effect';

import {
  decodeModuleInput as decodeInput,
  NumberId,
} from '../core/module-input.ts';
import type { ModuleActions } from '../core/request-actions.ts';
import { toModuleResponse } from '../core/response.ts';
import {
  decodeUpstreamBody,
  Loose,
  UpstreamObject,
} from '../core/upstream-body.ts';
import type { ModuleEffect } from '../types/index.ts';

export type ModuleInput = { id: NumberId };

const inputSchema = Schema.Struct({ id: NumberId });

export const decodeModuleInput = (input: unknown) =>
  decodeInput(inputSchema, input);

const RedCount = UpstreamObject({
  count: Schema.Finite,
  countDesc: Loose(Schema.String),
});

// 返回码、红心数量路径 `data` 和接口要拿的 `data.count` 收紧；`countDesc` 只是展示文案，宽松。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    data: RedCount,
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

export const moduleActions = {
  read: {
    target: '/api/song/red/count',
    profile: 'web',
    semantic: 'read',
    cache: 'none',
    retry: 'connect',
  },
} as const satisfies ModuleActions;

const songRedCount: ModuleEffect<
  ModuleInput,
  ModuleBody,
  typeof moduleActions
> = (query, request) =>
  Effect.gen(function* () {
    const data = {
      songId: query.id,
    };
    const response = yield* request('read', { data });
    const body = yield* decodeUpstreamBody(
      'song_red_count',
      ModuleBody,
      response,
    );
    return {
      ...toModuleResponse(response),
      body,
    };
  });

/**
 * 歌曲红心数量
 */
export default songRedCount;
