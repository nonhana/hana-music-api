import { Effect, Schema } from 'effect';

import {
  BooleanValue,
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

export type ModuleInput = {
  asc?: boolean;
  limit?: number;
  offset?: number;
  rid: NumberId;
};

const inputSchema = Schema.Struct({
  asc: Schema.optional(BooleanValue),
  limit: Schema.optional(NaturalValue),
  offset: Schema.optional(NaturalValue),
  rid: NumberId,
});

export const decodeModuleInput = (input: unknown) =>
  decodeInput(inputSchema, input);

export const moduleActions = {
  request: {
    profile: 'web',
    target: '/api/dj/program/byradio',
    semantic: 'read',
    cache: 'none',
    retry: 'connect',
  },
} as const satisfies ModuleActions;

// 通到节目列表的路径 `programs` 和每个节目自己的编号 `programs[].id` 收紧；总数、`more` 和节目其余字段宽松。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    programs: Schema.Array(DjProgram),
    count: Loose(Schema.Finite),
    more: Loose(Schema.Boolean),
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

const djProgram: ModuleEffect<ModuleInput, ModuleBody, typeof moduleActions> = (
  query,
  request,
) =>
  Effect.gen(function* () {
    const data = {
      radioId: query.rid,
      limit: query.limit || 30,
      offset: query.offset || 0,
      asc: query.asc ?? false,
    };
    const response = yield* request('request', { data });
    const body = yield* decodeUpstreamBody('dj_program', ModuleBody, response);
    return { ...toModuleResponse(response), body };
  });

/**
 * 电台节目列表
 */
export default djProgram;
