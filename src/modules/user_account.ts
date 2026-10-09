import { Effect, Schema } from 'effect';

import { decodeModuleInput as decodeInput } from '../core/module-input.ts';
import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import { decodeUpstreamBody, UpstreamObject } from '../core/upstream-body.ts';
import type { ModuleEffect } from '../types/index.ts';

export type ModuleInput = {};

const inputSchema = Schema.Struct({});

export const decodeModuleInput = (input: unknown) =>
  decodeInput(inputSchema, input).pipe(Effect.as({}));

// 登录失效时 `account` 和 `profile` 都是 null；匿名账号只有 `account`（`anonimousUser: true`）。`vipType` 为 0 表示不是会员。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    account: Schema.NullOr(
      UpstreamObject({
        id: Schema.Finite,
        anonimousUser: Schema.Boolean,
        vipType: Schema.Finite,
      }),
    ),
    profile: Schema.NullOr(
      UpstreamObject({
        userId: Schema.Finite,
        nickname: Schema.String,
        avatarUrl: Schema.String,
        vipType: Schema.Finite,
      }),
    ),
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

const userAccount: ModuleEffect<ModuleInput, ModuleBody> = (query, request) =>
  Effect.gen(function* () {
    const result = yield* request(
      buildApiRequestIntent(
        `/api/nuser/account/get`,
        {},
        createOption(query, 'weapi'),
      ),
    );
    return {
      ...toModuleResponse(result),
      body: yield* decodeUpstreamBody('user_account', ModuleBody, result),
    };
  });

export default userAccount;
