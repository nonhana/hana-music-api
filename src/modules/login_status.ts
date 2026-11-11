import { Effect, Schema } from 'effect';

import {
  decodeModuleInput as decodeInput,
  EmptyInput,
} from '../core/module-input.ts';
import type { NoInput } from '../core/module-input.ts';
import type { ModuleActions } from '../core/request-actions.ts';
import { toModuleResponse } from '../core/response.ts';
import { decodeUpstreamBody } from '../core/upstream-body.ts';
import type { ModuleEffect } from '../types/index.ts';
import { ModuleBody as AccountBody } from './user_account.ts';

export const moduleActions = {
  request: {
    profile: 'web',
    target: '/api/w/nuser/account/get',
    semantic: 'read',
    cache: 'none',
    retry: 'never',
  },
} as const satisfies ModuleActions;

export type ModuleInput = NoInput;

const inputSchema = EmptyInput;

export const decodeModuleInput = (input: unknown) =>
  decodeInput(inputSchema, input).pipe(Effect.as({}));

// 与 user_account 是同一份账号数据，外面多包一层 `data`；`data` 的路径和编号收紧，其余字段沿用宽松写法。
export const ModuleBody = Schema.toStandardSchemaV1(
  Schema.Struct({ data: AccountBody }),
);
export type ModuleBody = typeof ModuleBody.Type;

const loginStatus: ModuleEffect<
  ModuleInput,
  ModuleBody,
  typeof moduleActions
> = (_query, request) =>
  Effect.gen(function* () {
    const result = yield* request('request', { data: {} });
    const body = yield* decodeUpstreamBody('login_status', ModuleBody, result, {
      body: { data: result.body },
    });
    return { ...toModuleResponse(result), status: 200, body };
  });

export default loginStatus;
