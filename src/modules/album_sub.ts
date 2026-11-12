import { Effect, Schema } from 'effect';

import {
  decodeModuleInput as decodeInput,
  NumberId,
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

export type ModuleInput = { id: NumberId; t: 0 | 1 };

const inputSchema = Schema.Struct({
  id: NumberId,
  t: NumberLiterals([0, 1]),
});

export const decodeModuleInput = (input: unknown) =>
  decodeInput(inputSchema, input);

// 返回码收紧；其余字段宽松。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    time: Loose(Schema.Finite),
    message: Loose(Schema.String),
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

export const moduleActions = {
  sub: {
    profile: 'web',
    target: '/api/album/sub',
    semantic: 'write',
    cache: 'none',
    retry: 'never',
  },
  unsub: {
    profile: 'web',
    target: '/api/album/unsub',
    semantic: 'write',
    cache: 'none',
    retry: 'never',
  },
} as const satisfies ModuleActions;

const albumSub: ModuleEffect<ModuleInput, ModuleBody, typeof moduleActions> = (
  query,
  request,
) =>
  Effect.gen(function* () {
    const action = query.t === 1 ? 'sub' : 'unsub';
    const data = {
      id: query.id,
    };
    const response = yield* request(action, { data });
    return {
      ...toModuleResponse(response),
      body: yield* decodeUpstreamBody('album_sub', ModuleBody, response),
    };
  });

/**
 * 收藏/取消收藏专辑
 */
export default albumSub;
