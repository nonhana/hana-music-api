import { Effect, Schema } from 'effect';

import {
  decodeModuleInput as decodeInput,
  NaturalValue,
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
  phone: string;
  captcha: string;
  oldcaptcha: string;
  countrycode?: number;
};

const inputSchema = Schema.Struct({
  phone: Schema.String,
  captcha: Schema.String,
  oldcaptcha: Schema.String,
  countrycode: Schema.optional(NaturalValue),
});

export const decodeModuleInput = (input: unknown) =>
  decodeInput(inputSchema, input);

const userReplacephone: ModuleEffect<
  ModuleInput,
  UnknownJson,
  typeof moduleActions
> = (query, request) =>
  Effect.gen(function* () {
    const data = {
      phone: query.phone,
      captcha: query.captcha,
      oldcaptcha: query.oldcaptcha,
      countrycode: query.countrycode ? String(query.countrycode) : '86',
    };
    const response = yield* request('request', { data });
    return toModuleResponse(response);
  });

export default userReplacephone;
