import { Effect, Schema } from 'effect';

import { decodeModuleInput as decodeInput } from '../core/module-input.ts';
import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import { decodeUpstreamBody, UpstreamObject } from '../core/upstream-body.ts';
import type { ModuleEffect } from '../types/index.ts';

export type ModuleInput = {
  key: string;
};

const inputSchema = Schema.Struct({
  key: Schema.String,
});

export const decodeModuleInput = (input: unknown) =>
  decodeInput(inputSchema, input);

// 每个成员只认一个返回码，结构不符时只报命中那一支的问题；8821（扫码后要求行为验证）还没录到真实返回，作为业务拒绝原样转交。
export const ModuleBody = Schema.toStandardSchemaV1(
  Schema.Union([
    UpstreamObject({ code: Schema.Literal(800) }),
    UpstreamObject({ code: Schema.Literal(801) }),
    UpstreamObject({
      code: Schema.Literal(802),
      nickname: Schema.String,
      avatarUrl: Schema.String,
    }),
    UpstreamObject({ code: Schema.Literal(803) }),
  ]),
);
export type ModuleBody = typeof ModuleBody.Type;

const loginQrCheck: ModuleEffect<ModuleInput, ModuleBody> = (query, request) =>
  Effect.gen(function* () {
    const result = yield* request(
      buildApiRequestIntent(
        '/api/login/qrcode/client/login',
        { key: query.key, type: 3 },
        createOption(query),
      ),
    );
    const body = yield* decodeUpstreamBody(
      'login_qr_check',
      ModuleBody,
      result,
      {
        codes: [800, 801, 802, 803],
      },
    );
    return {
      ...toModuleResponse(result),
      status: 200,
      body: { ...body, cookie: result.cookie.join(';') },
    };
  });

export default loginQrCheck;
