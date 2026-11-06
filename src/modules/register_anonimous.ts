import { Effect, Schema } from 'effect';

import { Call } from '../core/call.ts';
import { UnexpectedUpstreamShape } from '../core/errors.ts';
import { decodeModuleInput as decodeInput } from '../core/module-input.ts';
import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import {
  decodeUpstreamBody,
  Loose,
  UpstreamObject,
} from '../core/upstream-body.ts';
import { encodeAnonymousDeviceId, isRecord } from '../core/utils.ts';
import type { ModuleEffect } from '../types/index.ts';

export type ModuleInput = {};

const inputSchema = Schema.Struct({});

export const decodeModuleInput = (input: unknown) =>
  decodeInput(inputSchema, input).pipe(Effect.as({}));

// 返回码、新建匿名账号自己的编号 `userId` 和匿名凭据 `cookie` 收紧，注册时间宽松；`cookie` 由响应的 Set-Cookie 拼出。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    userId: Schema.Finite,
    cookie: Schema.String,
    createTime: Loose(Schema.Finite),
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

const registerAnonymous: ModuleEffect<ModuleInput, ModuleBody> = (
  query,
  request,
) =>
  Effect.gen(function* () {
    const deviceId = (yield* Call).identity.state.deviceId;
    const username = Buffer.from(
      `${deviceId} ${encodeAnonymousDeviceId(deviceId)}`,
      'utf8',
    ).toString('base64');
    const result = yield* request(
      buildApiRequestIntent(
        '/api/register/anonimous',
        { username },
        createOption(query, 'weapi'),
      ),
    );
    const body = yield* decodeUpstreamBody(
      'register_anonimous',
      ModuleBody,
      result,
      {
        body: isRecord(result.body)
          ? { ...result.body, cookie: result.cookie.join(';') }
          : result.body,
      },
    );
    if (!result.cookie.some((cookie) => /^MUSIC_A=[^;]+/.test(cookie))) {
      return yield* new UnexpectedUpstreamShape({
        module: 'register_anonimous',
        path: 'cookie.MUSIC_A',
        expected: 'nonempty credential',
        actual: 'missing',
      });
    }
    return {
      ...toModuleResponse(result),
      status: 200,
      body,
    };
  });

export default registerAnonymous;
