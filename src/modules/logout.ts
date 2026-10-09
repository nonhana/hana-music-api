import { Effect, Schema } from 'effect';

import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import { decodeUpstreamBody, UpstreamObject } from '../core/upstream-body.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';

// 只注销同一个设备编号上的登录，其他设备上的登录不受影响。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({ code: Schema.Literal(200) }),
);
export type ModuleBody = typeof ModuleBody.Type;

const logout: ModuleEffect<ModuleInput, ModuleBody> = (query, request) =>
  Effect.gen(function* () {
    const result = yield* request(
      buildApiRequestIntent(`/api/logout`, {}, createOption(query)),
    );
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
