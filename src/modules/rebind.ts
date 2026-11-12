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
    target: '/api/user/replaceCellphone',
    semantic: 'login',
    cache: 'none',
    retry: 'never',
  },
} as const satisfies ModuleActions;

export type ModuleInput = {
  captcha: string;
  ctcode?: NumberId;
  oldcaptcha: string;
  phone: string;
};

const inputSchema = Schema.Struct({
  captcha: Schema.String,
  ctcode: Schema.optional(NumberId),
  oldcaptcha: Schema.String,
  phone: Schema.String,
});

export const decodeModuleInput = (input: unknown) =>
  decodeInput(inputSchema, input);

const rebind: ModuleEffect<ModuleInput, UnknownJson, typeof moduleActions> = (
  query,
  request,
) =>
  Effect.gen(function* () {
    const data = {
      captcha: query.captcha,
      phone: query.phone,
      oldcaptcha: query.oldcaptcha,
      ctcode: query.ctcode || '86',
    };
    const response = yield* request('request', { data });
    return toModuleResponse(response);
  });

/**
 * 更换手机
 */
export default rebind;
