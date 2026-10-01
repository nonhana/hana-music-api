import { createHash } from 'node:crypto';

import { Effect, Schema } from 'effect';

import { UnexpectedUpstreamShape } from '../core/errors.ts';
import { decodeModuleInput as decodeInput } from '../core/module-input.ts';
import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import { renameAvatarField } from '../core/utils.ts';
import type { ModuleEffect } from '../types/index.ts';

type PasswordCredential =
  | {
      md5_password?: string;
      password: string;
    }
  | {
      md5_password: string;
      password?: string;
    };

export type ModuleInput = PasswordCredential & {
  email: string;
};

const inputSchema = Schema.Union([
  Schema.Struct({
    md5_password: Schema.optional(Schema.String),
    password: Schema.String,
    email: Schema.String,
  }),
  Schema.Struct({
    md5_password: Schema.String,
    password: Schema.optional(Schema.String),
    email: Schema.String,
  }),
]);

export const decodeModuleInput = (input: unknown) =>
  decodeInput(inputSchema, input);

const login: ModuleEffect<ModuleInput> = (query, request) =>
  Effect.gen(function* () {
    const data = {
      type: '0',
      https: 'true',
      username: query.email,
      password:
        query.md5_password ||
        createHash('md5').update(String(query.password)).digest('hex'),
      rememberLogin: 'true',
    };
    const result = yield* request(
      buildApiRequestIntent('/api/w/login', data, createOption(query)),
    );
    const body = renameAvatarField(result.body);
    if (
      body === null ||
      typeof body !== 'object' ||
      Array.isArray(body) ||
      typeof body.code !== 'number'
    ) {
      return yield* new UnexpectedUpstreamShape({
        module: 'login',
        path: 'body.code',
        expected: 'number',
        actual: typeof body,
      });
    }
    if (body.code === 502) {
      return toModuleResponse({
        ...result,
        status: 200,
        cookie: [],
        body: { msg: '账号或密码错误', code: 502, message: '账号或密码错误' },
      });
    }
    if (body.code !== 200) {
      return toModuleResponse(result);
    }
    if (!result.cookie.some((cookie) => /^MUSIC_U=[^;]+/.test(cookie))) {
      return yield* new UnexpectedUpstreamShape({
        module: 'login',
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

export default login;
