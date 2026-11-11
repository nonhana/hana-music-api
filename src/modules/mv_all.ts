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
import { MvSummary } from '../core/upstream-schemas.ts';
import type { ModuleEffect } from '../types/index.ts';

export type ModuleInput = {
  area?: string;
  limit?: NaturalValue;
  offset?: NaturalValue;
  order?: string;
  type?: string;
};

const inputSchema = Schema.Struct({
  area: Schema.optional(Schema.String),
  limit: Schema.optional(NaturalValue),
  offset: Schema.optional(NaturalValue),
  order: Schema.optional(Schema.String),
  type: Schema.optional(Schema.String),
});

export const decodeModuleInput = (input: unknown) =>
  decodeInput(inputSchema, input);

export const moduleActions = {
  request: {
    profile: 'eapi',
    target: '/api/mv/all',
    semantic: 'read',
    cache: 'none',
    retry: 'connect',
  },
} as const satisfies ModuleActions;

// 通到全部 MV 列表的路径 `data` 和 MV 自己的编号 `data[].id` 收紧（共用 `MvSummary`）；`count` 在非首页缺失、`hasMore` 宽松。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    count: Loose(Schema.Finite),
    data: Schema.Array(MvSummary),
    hasMore: Loose(Schema.Boolean),
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

const mvAll: ModuleEffect<ModuleInput, ModuleBody, typeof moduleActions> = (
  query,
  request,
) =>
  Effect.gen(function* () {
    const data = {
      tags: JSON.stringify({
        地区: query.area || '全部',
        类型: query.type || '全部',
        排序: query.order || '上升最快',
      }),
      offset: query.offset || 0,
      total: 'true',
      limit: query.limit || 30,
    };
    const response = yield* request('request', { data });
    const body = yield* decodeUpstreamBody('mv_all', ModuleBody, response);
    return { ...toModuleResponse(response), body };
  });

/**
 * 全部MV
 */
export default mvAll;
