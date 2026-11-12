import { Effect, Schema } from 'effect';

import {
  decodeModuleInput as decodeInput,
  NaturalValue,
  NumberId,
} from '../core/module-input.ts';
import type { ModuleActions } from '../core/request-actions.ts';
import { toModuleResponse } from '../core/response.ts';
import { decodeUpstreamBody, UpstreamObject } from '../core/upstream-body.ts';
import type { ModuleEffect } from '../types/index.ts';

export type ModuleInput = {
  id: NumberId;
  limit?: NaturalValue;
  offset?: NaturalValue;
};

const inputSchema = Schema.Struct({
  id: NumberId,
  limit: Schema.optional(NaturalValue),
  offset: Schema.optional(NaturalValue),
});

export const decodeModuleInput = (input: unknown) =>
  decodeInput(inputSchema, input);

// 返回码收紧；相似用户列表 `userprofiles` 只有空数组证据、元素类型未知，未声明并由 `UpstreamObject` 原样保留。
// 缺少 `id` 时上游 HTTP 400 被归一成 `status: 200` 和空正文，空字符串作为独立分支声明。
export const ModuleBody = Schema.toStandardSchemaV1(
  Schema.Union([
    UpstreamObject({
      code: Schema.Literal(200),
    }),
    Schema.Literal(''),
  ]).annotate({ expected: 'object with code 200 or an empty string' }),
);
export type ModuleBody = typeof ModuleBody.Type;

export const moduleActions = {
  read: {
    target: '/api/discovery/simiUser',
    profile: 'web',
    semantic: 'read',
    cache: 'none',
    retry: 'connect',
  },
} as const satisfies ModuleActions;

const simiUser: ModuleEffect<ModuleInput, ModuleBody, typeof moduleActions> = (
  query,
  request,
) =>
  Effect.gen(function* () {
    const data = {
      songid: query.id,
      limit: query.limit || 50,
      offset: query.offset || 0,
    };
    const response = yield* request('read', { data });
    const body = yield* decodeUpstreamBody('simi_user', ModuleBody, response);
    return { ...toModuleResponse(response), body };
  });

/**
 * 相似用户
 */
export default simiUser;
