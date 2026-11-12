import { Effect, Schema } from 'effect';

import { decodeModuleInput as decodeInput } from '../core/module-input.ts';
import type { ModuleActions } from '../core/request-actions.ts';
import { toModuleResponse } from '../core/response.ts';
import { decodeUpstreamBody, UpstreamObject } from '../core/upstream-body.ts';
import type { ModuleEffect } from '../types/index.ts';

const Nickname = Schema.String.check(Schema.isPattern(/^[^;]+$/u));
const NicknameList = Schema.Array(Nickname).check(Schema.isMinLength(1));

export const moduleActions = {
  request: {
    profile: 'web',
    target: '/api/user/getUserIds',
    semantic: 'read',
    cache: 'none',
    retry: 'connect',
  },
} as const satisfies ModuleActions;

export type ModuleInput = {
  nicknames: ReadonlyArray<string>;
};

const inputSchema = Schema.Struct({
  nicknames: NicknameList,
});

export const decodeModuleInput = (input: unknown) =>
  decodeInput(inputSchema, input);

// 返回码和昵称到 user id 的映射 `nicknames` 收紧；没有匹配的昵称时映射是空对象。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    nicknames: Schema.Record(Schema.String, Schema.Finite),
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

const getUserids: ModuleEffect<
  ModuleInput,
  ModuleBody,
  typeof moduleActions
> = (query, request) =>
  Effect.gen(function* () {
    const data = {
      nicknames: query.nicknames.join(';'),
    };
    const response = yield* request('request', { data });
    const body = yield* decodeUpstreamBody('get_userids', ModuleBody, response);
    return { ...toModuleResponse(response), body };
  });

export default getUserids;
