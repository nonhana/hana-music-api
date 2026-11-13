import { Effect, Schema } from 'effect';

import { decodeModuleInput as decodeInput } from '../core/module-input.ts';
import type { ModuleActions } from '../core/request-actions.ts';
import { toModuleResponse } from '../core/response.ts';
import {
  decodeUpstreamBody,
  Loose,
  UpstreamObject,
} from '../core/upstream-body.ts';
import type { ModuleEffect } from '../types/index.ts';

export const moduleActions = {
  request: {
    profile: 'web',
    target: '/api/login/qrcode/client/login',
    semantic: 'poll',
    cache: 'none',
    retry: 'never',
  },
} as const satisfies ModuleActions;

export type ModuleInput = {
  key: string;
};

const inputSchema = Schema.Struct({
  key: Schema.String,
});

export const decodeModuleInput = (input: unknown) =>
  decodeInput(inputSchema, input);

// 每个成员只认一个返回码，结构不符时只报命中那一支的问题；8821（扫码后要求行为验证）还没录到真实返回，作为业务拒绝原样转交。
// 返回码收紧；扫码用户的昵称和头像宽松。
export const ModuleBody = Schema.toStandardSchemaV1(
  Schema.Union([
    UpstreamObject({
      code: Schema.Literal(800),
      message: Loose(Schema.String),
    }),
    UpstreamObject({
      code: Schema.Literal(801),
      message: Loose(Schema.String),
    }),
    UpstreamObject({
      code: Schema.Literal(802),
      nickname: Loose(Schema.String),
      avatarUrl: Loose(Schema.String),
      message: Loose(Schema.String),
    }),
    UpstreamObject({
      code: Schema.Literal(803),
      message: Loose(Schema.String),
    }),
  ]),
);
export type ModuleBody = typeof ModuleBody.Type;

const loginQrCheck: ModuleEffect<
  ModuleInput,
  ModuleBody,
  typeof moduleActions
> = (query, request) =>
  Effect.gen(function* () {
    const result = yield* request('request', {
      data: {
        key: query.key,
        type: 3,
      },
    });
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
