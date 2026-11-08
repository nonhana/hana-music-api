import { Effect, Schema } from 'effect';

import { decodeModuleInput as decodeInput } from '../core/module-input.ts';
import type { ModuleActions } from '../core/request-actions.ts';
import { buildActionRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import { decodeUpstreamBody, UpstreamObject } from '../core/upstream-body.ts';
import { Account, UserProfile } from '../core/upstream-schemas.ts';
import type { ModuleEffect } from '../types/index.ts';

export const moduleActions = {
  request: {
    profile: 'weapiPc',
    target: '/api/nuser/account/get',
    semantic: 'read',
    cache: 'none',
    retry: 'never',
  },
} as const satisfies ModuleActions;

export type ModuleInput = {};

const inputSchema = Schema.Struct({});

export const decodeModuleInput = (input: unknown) =>
  decodeInput(inputSchema, input).pipe(Effect.as({}));

// 返回码、`account` / `profile` 的路径和编号、账号是否匿名收紧；其余字段宽松。
// 登录失效时 `account` 和 `profile` 都是 null；匿名账号只有 `account`（`anonimousUser: true`）。`vipType` 为 0 表示不是会员。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    account: Schema.NullOr(
      UpstreamObject({
        ...Account.schema.fields,
        anonimousUser: Schema.Boolean,
      }),
    ),
    profile: Schema.NullOr(UserProfile),
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

const userAccount: ModuleEffect<ModuleInput, ModuleBody> = (_query, request) =>
  Effect.gen(function* () {
    const result = yield* request(
      buildActionRequestIntent('request', moduleActions['request'], {}),
    );
    return {
      ...toModuleResponse(result),
      body: yield* decodeUpstreamBody('user_account', ModuleBody, result),
    };
  });

export default userAccount;
