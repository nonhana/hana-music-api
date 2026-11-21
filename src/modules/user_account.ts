import * as Effect from 'effect/Effect';
import * as Schema from 'effect/Schema';

import {
  decodeModuleInput as decodeInput,
  EmptyInput,
} from '../core/module-input.ts';
import type { NoInput } from '../core/module-input.ts';
import type { ModuleActions } from '../core/request-actions.ts';
import { toModuleResponse } from '../core/response.ts';
import type { BodyType } from '../core/upstream-body.ts';
import {
  decodeUpstreamBody,
  defineModuleBody,
  UpstreamObject,
} from '../core/upstream-body.ts';
import { Account, UserProfile } from '../core/upstream-schemas.ts';
import type { ModuleEffect } from '../types/index.ts';

export const moduleActions = {
  request: {
    profile: 'web',
    target: '/api/nuser/account/get',
    semantic: 'read',
    cache: 'none',
    retry: 'never',
  },
} as const satisfies ModuleActions;

export type ModuleInput = NoInput;

const inputSchema = EmptyInput;

export const decodeModuleInput = (input: unknown) =>
  decodeInput(inputSchema, input).pipe(Effect.as({}));

export const userAccountBodySchema = UpstreamObject({
  code: Schema.Literal(200),
  account: Schema.NullOr(
    UpstreamObject({
      ...Account.schema.fields,
      anonimousUser: Schema.Boolean,
    }),
  ),
  profile: Schema.NullOr(UserProfile),
});

// 返回码、`account` / `profile` 的路径和编号、账号是否匿名收紧；其余字段宽松。
// 登录失效时 `account` 和 `profile` 都是 null；匿名账号只有 `account`（`anonimousUser: true`）。`vipType` 为 0 表示不是会员。
export const ModuleBody = /* @__PURE__ */ defineModuleBody(
  userAccountBodySchema,
);
export type ModuleBody = BodyType<typeof ModuleBody>;

const userAccount: ModuleEffect<
  ModuleInput,
  ModuleBody,
  typeof moduleActions
> = (_query, request) =>
  Effect.gen(function* () {
    const result = yield* request('request', { data: {} });
    return {
      ...toModuleResponse(result),
      body: yield* decodeUpstreamBody('user_account', ModuleBody, result),
    };
  });

export default userAccount;
