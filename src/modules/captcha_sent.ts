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
import type { ModuleEffect } from '../types/index.ts';

export const moduleActions = {
  request: {
    profile: 'web',
    target: '/api/sms/captcha/sent',
    semantic: 'login',
    cache: 'none',
    retry: 'never',
  },
} as const satisfies ModuleActions;

export type ModuleInput = {
  ctcode?: NumberId;
  phone: string;
};

const inputSchema = Schema.Struct({
  ctcode: Schema.optional(NumberId),
  phone: Schema.String,
});

export const decodeModuleInput = (input: unknown) =>
  decodeInput(inputSchema, input);

// 返回码收紧；其余字段宽松。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({ code: Schema.Literal(200), data: Loose(Schema.Boolean) }),
);
export type ModuleBody = typeof ModuleBody.Type;

const captchaSent: ModuleEffect<
  ModuleInput,
  ModuleBody,
  typeof moduleActions
> = (query, request) =>
  Effect.gen(function* () {
    const data = {
      ctcode: query.ctcode || '86',
      secrete: 'music_middleuser_pclogin',
      cellphone: query.phone,
    };
    const result = yield* request('request', { data });
    return {
      ...toModuleResponse(result),
      body: yield* decodeUpstreamBody('captcha_sent', ModuleBody, result),
    };
  });

/**
 * 发送验证码
 */
export default captchaSent;
