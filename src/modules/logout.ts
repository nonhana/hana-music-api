import { Effect, Schema } from 'effect';

import type { ModuleActions } from '../core/request-actions.ts';
import { toModuleResponse } from '../core/response.ts';
import { decodeUpstreamBody, UpstreamObject } from '../core/upstream-body.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';

export const moduleActions = {
  request: {
    profile: 'eapi',
    target: '/api/logout',
    semantic: 'login',
    cache: 'none',
    retry: 'never',
  },
} as const satisfies ModuleActions;

// 只注销同一个设备编号上的登录，其他设备上的登录不受影响。
// 接口只返回返回码，收紧的是返回码。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({ code: Schema.Literal(200) }),
);
export type ModuleBody = typeof ModuleBody.Type;

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

export { decodeLegacyModuleInput as decodeModuleInput } from '../core/module-input.ts';

export type ModuleInput = LegacyModuleInput;
