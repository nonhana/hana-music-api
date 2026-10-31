import { Effect, Schema } from 'effect';

import { decodeModuleInput as decodeInput } from '../core/module-input.ts';
import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import {
  decodeUpstreamBody,
  Loose,
  UpstreamObject,
} from '../core/upstream-body.ts';
import type { ModuleEffect } from '../types/index.ts';

export type ModuleInput = {};

const inputSchema = Schema.Struct({});

export const decodeModuleInput = (input: unknown) =>
  decodeInput(inputSchema, input).pipe(Effect.as({}));

// 返回码、等级信息的路径 `data`、账号自己的 `data.userId` 和接口要返回的 `data.level` 收紧；其余字段宽松。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    data: UpstreamObject({
      userId: Schema.Finite,
      level: Schema.Finite,
      info: Loose(Schema.String),
      nextLoginCount: Loose(Schema.Finite),
      nextPlayCount: Loose(Schema.Finite),
      nowLoginCount: Loose(Schema.Finite),
      nowPlayCount: Loose(Schema.Finite),
      progress: Loose(Schema.Finite),
    }),
    full: Loose(Schema.Boolean),
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

const userLevel: ModuleEffect<ModuleInput, ModuleBody> = (query, request) =>
  Effect.gen(function* () {
    const data = {};
    const result = yield* request(
      buildApiRequestIntent(
        `/api/user/level`,
        data,
        createOption(query, 'weapi'),
      ),
    );
    return {
      ...toModuleResponse(result),
      body: yield* decodeUpstreamBody('user_level', ModuleBody, result),
    };
  });

/**
 * 账号等级
 */
export default userLevel;
