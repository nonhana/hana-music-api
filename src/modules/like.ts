import { Effect, Schema } from 'effect';

import {
  BooleanValue,
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

// 返回码收紧；其余字段宽松。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    playlistId: Loose(Schema.Finite),
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

export const moduleActions = {
  like: {
    target: '/api/song/like',
    profile: 'web',
    semantic: 'write',
    cache: 'none',
    retry: 'never',
  },
  unlike: {
    target: '/api/song/like',
    profile: 'web',
    semantic: 'write',
    cache: 'none',
    retry: 'never',
  },
} as const satisfies ModuleActions;

export type ModuleInput = {
  id: NumberId;
  like?: boolean;
};

const inputSchema = Schema.Struct({
  id: NumberId,
  like: Schema.optional(BooleanValue),
});

export const decodeModuleInput = (input: unknown) =>
  decodeInput(inputSchema, input);

const like: ModuleEffect<ModuleInput, ModuleBody, typeof moduleActions> = (
  input,
  request,
) =>
  Effect.gen(function* () {
    const liked = input.like ?? true;
    const data = {
      alg: 'itembased',
      trackId: input.id,
      like: liked,
      time: '3',
    };
    const action = liked ? 'like' : 'unlike';
    const response = yield* request(action, { data });
    return {
      ...toModuleResponse(response),
      body: yield* decodeUpstreamBody('like', ModuleBody, response),
    };
  });

/**
 * 红心与取消红心歌曲
 */
export default like;
