import { Effect, Schema } from 'effect';

import {
  decodeModuleInput as decodeInput,
  NaturalValue,
} from '../core/module-input.ts';
import type { ModuleActions } from '../core/request-actions.ts';
import { toModuleResponse } from '../core/response.ts';
import {
  decodeUpstreamBody,
  Loose,
  UpstreamObject,
} from '../core/upstream-body.ts';
import type { ModuleEffect } from '../types/index.ts';

export type ModuleInput = { limit?: NaturalValue; offset?: NaturalValue };

const inputSchema = Schema.Struct({
  limit: Schema.optional(NaturalValue),
  offset: Schema.optional(NaturalValue),
});

export const decodeModuleInput = (input: unknown) =>
  decodeInput(inputSchema, input);

export const moduleActions = {
  request: {
    profile: 'web',
    target: '/api/forwards/get',
    semantic: 'read',
    cache: 'none',
    retry: 'never',
  },
} as const satisfies ModuleActions;

// 转发来源是记录里套着的对象，字段全部宽松。
const ForwardOrigin = UpstreamObject({
  forwards: Loose(Schema.String),
  id: Loose(Schema.Finite),
  json: Loose(Schema.String),
  time: Loose(Schema.Finite),
  type: Loose(Schema.Finite),
  userId: Loose(Schema.Finite),
});

const ForwardRecord = UpstreamObject({
  id: Schema.Finite,
  json: Loose(Schema.String),
  resourceExist: Loose(Schema.Boolean),
  time: Loose(Schema.Finite),
  type: Loose(Schema.Finite),
  uf: Loose(ForwardOrigin),
  userId: Loose(Schema.Finite),
});

// 通到 @我 列表的路径 `forwards` 和每条转发自己的编号 `forwards[].id` 收紧；其余字段宽松。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    forwards: Schema.Array(ForwardRecord),
    lasttime: Loose(Schema.Finite),
    more: Loose(Schema.Boolean),
    newCount: Loose(Schema.Finite),
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

const msgForwards: ModuleEffect<
  ModuleInput,
  ModuleBody,
  typeof moduleActions
> = (query, request) =>
  Effect.gen(function* () {
    const data = {
      offset: query.offset || 0,
      limit: query.limit || 30,
      total: 'true',
    };
    const response = yield* request('request', { data });
    const body = yield* decodeUpstreamBody(
      'msg_forwards',
      ModuleBody,
      response,
    );
    return { ...toModuleResponse(response), body };
  });

/**
 * @我
 */
export default msgForwards;
