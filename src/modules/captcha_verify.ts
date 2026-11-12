import { Effect, Schema } from 'effect';

import {
  decodeModuleInput as decodeInput,
  NumberId,
} from '../core/module-input.ts';
import type { ModuleActions } from '../core/request-actions.ts';
import { toModuleResponse } from '../core/response.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { UnknownJson } from '../types/unknown.ts';

export const moduleActions = {
  request: {
    profile: 'web',
    target: '/api/sms/captcha/verify',
    semantic: 'login',
    cache: 'none',
    retry: 'never',
  },
} as const satisfies ModuleActions;

export type ModuleInput = {
  captcha: string;
  ctcode?: NumberId;
  phone: string;
};

const inputSchema = Schema.Struct({
  captcha: Schema.String,
  ctcode: Schema.optional(NumberId),
  phone: Schema.String,
});

export const decodeModuleInput = (input: unknown) =>
  decodeInput(inputSchema, input);

const captchaVerify: ModuleEffect<
  ModuleInput,
  UnknownJson,
  typeof moduleActions
> = (query, request) =>
  Effect.gen(function* () {
    const data = {
      ctcode: query.ctcode || '86',
      cellphone: query.phone,
      captcha: query.captcha,
    };
    const response = yield* request('request', { data });
    return toModuleResponse(response);
  });

/**
 * 校验验证码
 */
export default captchaVerify;
