import { Effect, Schema } from 'effect';

import {
  decodeModuleInput as decodeInput,
  EmptyInput,
} from '../core/module-input.ts';
import type { NoInput } from '../core/module-input.ts';
import type { ModuleActions } from '../core/request-actions.ts';
import { toModuleResponse } from '../core/response.ts';
import {
  decodeUpstreamBody,
  Loose,
  UpstreamObject,
} from '../core/upstream-body.ts';
import type { ModuleEffect } from '../types/index.ts';

export const moduleActions = {
  request: {
    profile: 'eapi',
    target: '/api/social/user/status/support',
    semantic: 'read',
    cache: 'none',
    retry: 'connect',
  },
} as const satisfies ModuleActions;

export type ModuleInput = NoInput;

const inputSchema = EmptyInput;

export const decodeModuleInput = (input: unknown) =>
  decodeInput(inputSchema, input).pipe(Effect.as({}));

const SupportStatus = UpstreamObject({
  type: Schema.String,
  iconUrl: Loose(Schema.String),
  content: Loose(Schema.String),
  actionUrl: Loose(Schema.String),
  vistorUrl: Loose(Schema.String),
  canEdit: Loose(Schema.Boolean),
  desc: Loose(Schema.String),
});

// 返回码、可设置状态列表 data 和每条状态的 type 收紧；列表就是接口要返回的东西，图标、文案和跳转地址宽松。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    data: Schema.Array(SupportStatus),
    message: Loose(Schema.String),
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

const userSocialStatusSupport: ModuleEffect<
  ModuleInput,
  ModuleBody,
  typeof moduleActions
> = (_query, request) =>
  Effect.gen(function* () {
    const response = yield* request('request', { data: {} });
    const body = yield* decodeUpstreamBody(
      'user_social_status_support',
      ModuleBody,
      response,
    );
    return { ...toModuleResponse(response), body };
  });

/**
 * 用户状态 - 支持设置的状态
 */
export default userSocialStatusSupport;
