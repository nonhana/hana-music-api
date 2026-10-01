import { createHash } from 'node:crypto';

import { Effect, Schema } from 'effect';

import {
  decodeModuleInput as decodeInput,
  QueryNumber,
} from '../core/module-input.ts';
import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { QueryNumberLike } from '../types/module-shared.ts';

export type ModuleInput = {
  captcha: string;
  countrycode?: QueryNumberLike;
  nickname: string;
  password: string;
  phone: string;
};

const inputSchema = Schema.Struct({
  captcha: Schema.String,
  countrycode: Schema.optional(QueryNumber),
  nickname: Schema.String,
  password: Schema.String,
  phone: Schema.String,
});

export const decodeModuleInput = (input: unknown) =>
  decodeInput(inputSchema, input);

const registerCellphone: ModuleEffect<ModuleInput> = (query, request) =>
  Effect.gen(function* () {
    const data = {
      captcha: query.captcha,
      phone: query.phone,
      password: createHash('md5').update(query.password).digest('hex'),
      nickname: query.nickname,
      countrycode: query.countrycode || '86',
      force: 'false',
    };
    return toModuleResponse(
      yield* request(
        buildApiRequestIntent(
          `/api/w/register/cellphone`,
          data,
          createOption(query),
        ),
      ),
    );
  });

/**
 * 注册账号
 */
export default registerCellphone;
