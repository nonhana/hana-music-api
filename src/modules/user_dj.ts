import { Effect, Schema } from 'effect';

import {
  decodeModuleInput as decodeInput,
  NaturalValue,
  NumberId,
} from '../core/module-input.ts';
import type { ModuleActions } from '../core/request-actions.ts';
import { toModuleResponse } from '../core/response.ts';
import {
  decodeUpstreamBody,
  Loose,
  UpstreamObject,
} from '../core/upstream-body.ts';
import { DjProgram } from '../core/upstream-schemas.ts';
import type { ModuleEffect } from '../types/index.ts';

export const moduleActions = {
  request: {
    profile: 'web',
    target: { prefix: '/api/dj/program/' },
    semantic: 'read',
    cache: 'none',
    retry: 'connect',
  },
} as const satisfies ModuleActions;

export type ModuleInput = {
  uid: NumberId;
  limit?: number;
  offset?: number;
};

const inputSchema = Schema.Struct({
  uid: NumberId,
  limit: Schema.optional(NaturalValue),
  offset: Schema.optional(NaturalValue),
});

export const decodeModuleInput = (input: unknown) =>
  decodeInput(inputSchema, input);

// 通到节目列表的路径 `programs` 和每个节目自己的编号 `programs[].id` 收紧；没有节目时数组为空。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    count: Loose(Schema.Finite),
    more: Loose(Schema.Boolean),
    programs: Schema.Array(DjProgram),
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

const userDj: ModuleEffect<ModuleInput, ModuleBody, typeof moduleActions> = (
  query,
  request,
) =>
  Effect.gen(function* () {
    const data = {
      limit: query.limit || 30,
      offset: query.offset || 0,
    };
    const response = yield* request('request', {
      data,
      path: `/api/dj/program/${query.uid}`,
    });
    const body = yield* decodeUpstreamBody('user_dj', ModuleBody, response);
    return { ...toModuleResponse(response), body };
  });

/**
 * 用户电台节目
 */
export default userDj;
