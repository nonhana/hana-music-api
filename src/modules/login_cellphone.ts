import { createHash } from 'node:crypto';

import { Effect, Schema } from 'effect';

import { UnexpectedUpstreamShape } from '../core/errors.ts';
import {
  decodeModuleInput as decodeInput,
  QueryNumber,
} from '../core/module-input.ts';
import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import { renameAvatarField } from '../core/utils.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { QueryNumberLike } from '../types/module-shared.ts';

type PasswordCredential =
  | {
      md5_password?: string;
      password: string;
    }
  | {
      md5_password: string;
      password?: string;
    };

type LoginCellphoneBaseQuery = {
  countrycode?: QueryNumberLike;
  phone: string;
};

type LoginCellphoneCaptchaCredential = {
  captcha: string;
  md5_password?: string;
  password?: string;
};

type LoginCellphonePasswordCredential = PasswordCredential & {
  captcha?: string;
};

export type ModuleInput = LoginCellphoneBaseQuery &
  (LoginCellphoneCaptchaCredential | LoginCellphonePasswordCredential);

const inputSchema = Schema.Union([
  Schema.Struct({
    countrycode: Schema.optional(QueryNumber),
    phone: Schema.String,
    captcha: Schema.String,
    md5_password: Schema.optional(Schema.String),
    password: Schema.optional(Schema.String),
  }),
  Schema.Struct({
    countrycode: Schema.optional(QueryNumber),
    phone: Schema.String,
    md5_password: Schema.optional(Schema.String),
    password: Schema.String,
    captcha: Schema.optional(Schema.String),
  }),
  Schema.Struct({
    countrycode: Schema.optional(QueryNumber),
    phone: Schema.String,
    md5_password: Schema.String,
    password: Schema.optional(Schema.String),
    captcha: Schema.optional(Schema.String),
  }),
]);

export const decodeModuleInput = (input: unknown) =>
  decodeInput(inputSchema, input);

const loginCellphone: ModuleEffect<ModuleInput> = (query, request) =>
  Effect.gen(function* () {
    const data = {
      type: '1',
      https: 'true',
      phone: query.phone,
      countrycode: query.countrycode || '86',
      captcha: query.captcha,
      [query.captcha ? 'captcha' : 'password']: query.captcha
        ? query.captcha
        : query.md5_password ||
          createHash('md5').update(String(query.password)).digest('hex'),
      remember: 'true',
    };
    const result = yield* request(
      buildApiRequestIntent(
        '/api/w/login/cellphone',
        data,
        createOption(query, 'weapi'),
      ),
    );
    const body = renameAvatarField(result.body);
    if (
      body === null ||
      typeof body !== 'object' ||
      Array.isArray(body) ||
      typeof body.code !== 'number'
    ) {
      return yield* new UnexpectedUpstreamShape({
        module: 'login_cellphone',
        path: 'body.code',
        expected: 'number',
        actual: typeof body,
      });
    }
    if (body.code !== 200) {
      return toModuleResponse(result);
    }
    if (!result.cookie.some((cookie) => /^MUSIC_U=[^;]+/.test(cookie))) {
      return yield* new UnexpectedUpstreamShape({
        module: 'login_cellphone',
        path: 'cookie.MUSIC_U',
        expected: 'nonempty credential',
        actual: 'missing',
      });
    }
    return toModuleResponse({
      ...result,
      status: 200,
      body: { ...body, cookie: result.cookie.join(';') },
    });
  });

export default loginCellphone;
