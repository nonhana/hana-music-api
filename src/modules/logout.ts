import * as Effect from 'effect/Effect';
import * as Schema from 'effect/Schema';

import {
  decodeModuleInput as decodeInput,
  EmptyInput,
} from '../core/module-input.ts';
import type { NoInput } from '../core/module-input.ts';
import type { ModuleActions } from '../core/request-actions.ts';
import { toModuleResponse } from '../core/response.ts';
import type { BodyType } from '../core/upstream-body.ts';
import {
  decodeUpstreamBody,
  defineModuleBody,
  UpstreamObject,
} from '../core/upstream-body.ts';
import type { ModuleEffect } from '../types/index.ts';

export const moduleActions = {
  request: {
    profile: 'web',
    target: '/api/logout',
    semantic: 'login',
    cache: 'none',
    retry: 'never',
  },
} as const satisfies ModuleActions;

export type ModuleInput = NoInput;

const inputSchema = EmptyInput;

export const decodeModuleInput = (input: unknown) =>
  decodeInput(inputSchema, input).pipe(Effect.as({}));

// 只注销同一个设备编号上的登录，其他设备上的登录不受影响。
// 接口只返回返回码，收紧的是返回码。
export const ModuleBody = /* @__PURE__ */ defineModuleBody(
  UpstreamObject({ code: Schema.Literal(200) }),
);
export type ModuleBody = BodyType<typeof ModuleBody>;

const logout: ModuleEffect<ModuleInput, ModuleBody, typeof moduleActions> = (
  _query,
  request,
) =>
  Effect.gen(function* () {
    const result = yield* request('request', { data: {} });
    return {
      ...toModuleResponse(result),
      body: yield* decodeUpstreamBody('logout', ModuleBody, result),
    };
  });

/**
 * 退出登录
 */
export default logout;
