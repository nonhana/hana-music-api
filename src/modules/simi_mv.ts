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
import { MvSummary } from '../core/upstream-schemas.ts';
import type { ModuleEffect } from '../types/index.ts';

export type ModuleInput = { mvid: NumberId };

const inputSchema = Schema.Struct({ mvid: NumberId });

export const decodeModuleInput = (input: unknown) =>
  decodeInput(inputSchema, input);

// 相似 MV 记录复用 `MvSummary`，另声明录制里非 null 的 `alg`；`desc` 只见过 null，未声明。
const SimiMv = UpstreamObject({
  ...MvSummary.schema.fields,
  alg: Loose(Schema.String),
});

// 通到相似 MV 列表的路径 `mvs` 和每个 MV 的编号收紧（复用 `SimiMv`）；其余字段宽松。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    mvs: Schema.Array(SimiMv),
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

export const moduleActions = {
  read: {
    target: '/api/discovery/simiMV',
    profile: 'web',
    semantic: 'read',
    cache: 'none',
    retry: 'connect',
  },
} as const satisfies ModuleActions;

const simiMv: ModuleEffect<ModuleInput, ModuleBody, typeof moduleActions> = (
  query,
  request,
) =>
  Effect.gen(function* () {
    const data = {
      mvid: query.mvid,
    };
    const response = yield* request('read', { data });
    const body = yield* decodeUpstreamBody('simi_mv', ModuleBody, response);
    return { ...toModuleResponse(response), body };
  });

/**
 * 相似MV
 */
export default simiMv;
