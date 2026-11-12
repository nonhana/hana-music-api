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
import { isRecord } from '../core/utils.ts';
import type { ModuleEffect } from '../types/index.ts';

export const moduleActions = {
  request: {
    profile: 'eapi',
    target: '/api/login/token/refresh',
    semantic: 'login',
    cache: 'none',
    retry: 'never',
  },
} as const satisfies ModuleActions;

export type ModuleInput = NoInput;

const inputSchema = EmptyInput;

export const decodeModuleInput = (input: unknown) =>
  decodeInput(inputSchema, input).pipe(Effect.as({}));

// 续期成功时新的 MUSIC_U 在 `cookie` 里；扫码和短信两种登录得到的 Cookie 都能续期。返回码和 Cookie 收紧。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    cookie: Schema.String,
    bizCode: Loose(Schema.String),
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

const loginRefresh: ModuleEffect<
  ModuleInput,
  ModuleBody,
  typeof moduleActions
> = (_query, request) =>
  Effect.gen(function* () {
    const result = yield* request('request', { data: {} });
    const body = yield* decodeUpstreamBody(
      'login_refresh',
      ModuleBody,
      result,
      {
        body: isRecord(result.body)
          ? { ...result.body, cookie: result.cookie.join(';') }
          : result.body,
      },
    );
    return { ...toModuleResponse(result), status: 200, body };
  });

export default loginRefresh;
