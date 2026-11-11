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

export const moduleActions = {
  request: {
    profile: 'web',
    target: { prefix: '/api/v1/user/bindings/' },
    semantic: 'read',
    cache: 'none',
    retry: 'connect',
  },
} as const satisfies ModuleActions;

const Binding = UpstreamObject({
  id: Schema.Finite,
  bindingTime: Loose(Schema.Finite),
  expired: Loose(Schema.Boolean),
  expiresIn: Loose(Schema.Finite),
  refreshTime: Loose(Schema.Finite),
  tokenJsonStr: Loose(Schema.String),
  type: Loose(Schema.Finite),
  url: Loose(Schema.String),
  userId: Loose(Schema.Finite),
});

export type ModuleInput = {
  uid: NumberId;
};

const inputSchema = Schema.Struct({
  uid: NumberId,
});

export const decodeModuleInput = (input: unknown) =>
  decodeInput(inputSchema, input);

// 返回码、绑定列表 `bindings` 和每条绑定自己的 `id` 收紧；其余字段宽松。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    bindings: Schema.Array(Binding),
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

const userBinding: ModuleEffect<
  ModuleInput,
  ModuleBody,
  typeof moduleActions
> = (query, request) =>
  Effect.gen(function* () {
    const data = {};
    const result = yield* request('request', {
      data,
      path: `/api/v1/user/bindings/${String(query.uid)}`,
    });
    return {
      ...toModuleResponse(result),
      body: yield* decodeUpstreamBody('user_binding', ModuleBody, result),
    };
  });

export default userBinding;
