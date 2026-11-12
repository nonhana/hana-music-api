import { Effect, Schema } from 'effect';

import {
  decodeModuleInput as decodeInput,
  EmptyInput,
} from '../core/module-input.ts';
import type { NoInput } from '../core/module-input.ts';
import type { ModuleActions } from '../core/request-actions.ts';
import { toModuleResponse } from '../core/response.ts';
import {
  decodeUpstreamBody,
  Loose,
  UpstreamObject,
} from '../core/upstream-body.ts';
import { MvSummary } from '../core/upstream-schemas.ts';
import type { ModuleEffect } from '../types/index.ts';

export type ModuleInput = NoInput;

const inputSchema = EmptyInput;

export const decodeModuleInput = (input: unknown) =>
  decodeInput(inputSchema, input).pipe(Effect.as({}));

// 推荐 MV 复用 `MvSummary`，另声明卡片特有字段；`trackNumberUpdateTime` 只见过 `null`，未声明。
const RecommendedMv = UpstreamObject({
  ...MvSummary.schema.fields,
  alg: Loose(Schema.String),
  canDislike: Loose(Schema.Boolean),
  copywriter: Loose(Schema.String),
  picUrl: Loose(Schema.String),
  type: Loose(Schema.Finite),
});

// 通到推荐 MV 的路径 `result` 和每个 MV 自己的编号 `result[].id` 收紧（共用 `MvSummary`）；`category` 和卡片其余字段宽松。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    result: Schema.Array(RecommendedMv),
    category: Loose(Schema.Finite),
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

export const moduleActions = {
  read: {
    target: '/api/personalized/mv',
    profile: 'web',
    semantic: 'read',
    cache: 'none',
    retry: 'connect',
  },
} as const satisfies ModuleActions;

const personalizedMv: ModuleEffect<
  ModuleInput,
  ModuleBody,
  typeof moduleActions
> = (_query, request) =>
  Effect.gen(function* () {
    const response = yield* request('read', { data: {} });
    const body = yield* decodeUpstreamBody(
      'personalized_mv',
      ModuleBody,
      response,
    );
    return { ...toModuleResponse(response), body };
  });

/**
 * 推荐MV
 */
export default personalizedMv;
