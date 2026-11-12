import { Effect, Schema } from 'effect';

import {
  decodeModuleInput as decodeInput,
  EmptyInput,
} from '../core/module-input.ts';
import type { NoInput } from '../core/module-input.ts';
import type { ModuleActions } from '../core/request-actions.ts';
import { toModuleResponse } from '../core/response.ts';
import { decodeUpstreamBody, UpstreamObject } from '../core/upstream-body.ts';
import type { ModuleEffect } from '../types/index.ts';

export type ModuleInput = NoInput;

const inputSchema = EmptyInput;

export const decodeModuleInput = (input: unknown) =>
  decodeInput(inputSchema, input).pipe(Effect.as({}));

export const moduleActions = {
  request: {
    profile: 'web',
    target: '/api/point/signed/get',
    semantic: 'read',
    cache: 'none',
    retry: 'connect',
  },
} as const satisfies ModuleActions;

// 返回码、签到状态路径 `data` 及连续签到天数 `days` 和当天获得的云贝 `shells` 收紧。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    data: UpstreamObject({
      days: Schema.Finite,
      shells: Schema.Finite,
    }),
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

const yunbei: ModuleEffect<ModuleInput, ModuleBody, typeof moduleActions> = (
  _query,
  request,
) =>
  Effect.gen(function* () {
    const data = {};
    const response = yield* request('request', { data });
    const body = yield* decodeUpstreamBody('yunbei', ModuleBody, response);
    return { ...toModuleResponse(response), body };
  });

/**
 * 云贝签到状态
 */
export default yunbei;
