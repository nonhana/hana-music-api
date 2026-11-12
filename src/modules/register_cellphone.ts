import { createHash } from 'node:crypto';

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
    profile: 'eapi',
    target: '/api/w/register/cellphone',
    semantic: 'login',
    cache: 'none',
    retry: 'never',
  },
} as const satisfies ModuleActions;

export type ModuleInput = {
  captcha: string;
  countrycode?: NumberId;
  nickname: string;
  password: string;
  phone: string;
};

const inputSchema = Schema.Struct({
  captcha: Schema.String,
  countrycode: Schema.optional(NumberId),
  nickname: Schema.String,
  password: Schema.String,
  phone: Schema.String,
});

export const decodeModuleInput = (input: unknown) =>
  decodeInput(inputSchema, input);

const registerCellphone: ModuleEffect<
  ModuleInput,
  UnknownJson,
  typeof moduleActions
> = (query, request) =>
  Effect.gen(function* () {
    const data = {
      captcha: query.captcha,
      phone: query.phone,
      password: createHash('md5').update(query.password).digest('hex'),
      nickname: query.nickname,
      countrycode: query.countrycode || '86',
      force: 'false',
    };
    const response = yield* request('request', { data });
    return toModuleResponse(response);
  });

/**
 * 注册账号
 */
export default registerCellphone;
