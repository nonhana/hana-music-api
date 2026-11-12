import { Effect, Schema } from 'effect';

import {
  decodeModuleInput as decodeInput,
  NaturalValue,
} from '../core/module-input.ts';
import type { ModuleActions } from '../core/request-actions.ts';
import { toModuleResponse } from '../core/response.ts';
import { decodeUpstreamBody, UpstreamObject } from '../core/upstream-body.ts';
import { MvSummary } from '../core/upstream-schemas.ts';
import type { ModuleEffect } from '../types/index.ts';

export type ModuleInput = {
  area?: string;
  limit?: NaturalValue;
};

const inputSchema = Schema.Struct({
  area: Schema.optional(Schema.String),
  limit: Schema.optional(NaturalValue),
});

export const decodeModuleInput = (input: unknown) =>
  decodeInput(inputSchema, input);

export const moduleActions = {
  request: {
    profile: 'eapi',
    target: '/api/mv/first',
    semantic: 'read',
    cache: 'none',
    retry: 'connect',
  },
} as const satisfies ModuleActions;

// 通到最新 MV 列表的路径 `data` 和 MV 自己的编号 `data[].id` 收紧（共用 `MvSummary`）；筛选不到时 `data` 是空数组。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    data: Schema.Array(MvSummary),
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

const mvFirst: ModuleEffect<ModuleInput, ModuleBody, typeof moduleActions> = (
  query,
  request,
) =>
  Effect.gen(function* () {
    const data = {
      area: query.area || '',
      limit: query.limit || 30,
      total: true,
    };
    const response = yield* request('request', { data });
    const body = yield* decodeUpstreamBody('mv_first', ModuleBody, response);
    return { ...toModuleResponse(response), body };
  });

/**
 * 最新MV
 */
export default mvFirst;
