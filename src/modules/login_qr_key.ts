import { Effect, Schema } from 'effect';

import type { ModuleActions } from '../core/request-actions.ts';
import { toModuleResponse } from '../core/response.ts';
import { decodeUpstreamBody, UpstreamObject } from '../core/upstream-body.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';

export const moduleActions = {
  request: {
    profile: 'eapi',
    target: '/api/login/qrcode/unikey',
    semantic: 'login',
    cache: 'none',
    retry: 'never',
  },
} as const satisfies ModuleActions;

// 返回码和二维码 key 收紧。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    data: UpstreamObject({ unikey: Schema.String }),
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

const loginQrKey: ModuleEffect<
  ModuleInput,
  ModuleBody,
  typeof moduleActions
> = (_query, request) =>
  Effect.gen(function* () {
    const result = yield* request('request', {
      data: {
        type: 3,
      },
    });
    const body = yield* decodeUpstreamBody('login_qr_key', ModuleBody, result, {
      body: { data: result.body, code: 200 },
    });
    return { ...toModuleResponse(result), status: 200, body };
  });

export default loginQrKey;
export { decodeLegacyModuleInput as decodeModuleInput } from '../core/module-input.ts';

export type ModuleInput = LegacyModuleInput;
