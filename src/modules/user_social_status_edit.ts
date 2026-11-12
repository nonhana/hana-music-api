import { Effect, Schema } from 'effect';

import { decodeModuleInput as decodeInput } from '../core/module-input.ts';
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
    target: '/api/social/user/status/edit',
    semantic: 'write',
    cache: 'none',
    retry: 'never',
  },
} as const satisfies ModuleActions;

export type ModuleInput = {
  type?: string;
  iconUrl?: string;
  content?: string;
  actionUrl?: string;
};

const inputSchema = Schema.Struct({
  type: Schema.optional(Schema.String),
  iconUrl: Schema.optional(Schema.String),
  content: Schema.optional(Schema.String),
  actionUrl: Schema.optional(Schema.String),
});

export const decodeModuleInput = (input: unknown) =>
  decodeInput(inputSchema, input);

// 返回码收紧；`data` 是设置成功后的展示提示（录制里是字符串“将展示7天”），`message` 是附带
// 提示，都宽松。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    data: Loose(Schema.String),
    message: Loose(Schema.String),
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

const userSocialStatusEdit: ModuleEffect<
  ModuleInput,
  ModuleBody,
  typeof moduleActions
> = (query, request) =>
  Effect.gen(function* () {
    const response = yield* request('request', {
      data: {
        content: JSON.stringify({
          type: query.type,
          iconUrl: query.iconUrl,
          content: query.content,
          actionUrl: query.actionUrl,
        }),
      },
    });
    return {
      ...toModuleResponse(response),
      body: yield* decodeUpstreamBody(
        'user_social_status_edit',
        ModuleBody,
        response,
      ),
    };
  });

/**
 * 用户状态 - 编辑
 */
export default userSocialStatusEdit;
