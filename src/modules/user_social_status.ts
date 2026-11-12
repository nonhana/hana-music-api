import { Effect, Schema } from 'effect';

import {
  decodeModuleInput as decodeInput,
  NumberId,
} from '../core/module-input.ts';
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
    target: '/api/social/user/status',
    semantic: 'read',
    cache: 'none',
    retry: 'never',
  },
} as const satisfies ModuleActions;

export type ModuleInput = {
  uid: NumberId;
};

const inputSchema = Schema.Struct({
  uid: NumberId,
});

export const decodeModuleInput = (input: unknown) =>
  decodeInput(inputSchema, input);

// 返回码收紧；要拿的社交状态 `data` 在录制里只有空对象，按宽松对象保留，内部字段不声明。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    data: Loose(UpstreamObject({})),
    message: Loose(Schema.String),
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

const userSocialStatus: ModuleEffect<
  ModuleInput,
  ModuleBody,
  typeof moduleActions
> = (query, request) =>
  Effect.gen(function* () {
    const result = yield* request('request', {
      data: {
        visitorId: query.uid,
      },
    });
    return {
      ...toModuleResponse(result),
      body: yield* decodeUpstreamBody('user_social_status', ModuleBody, result),
    };
  });

/**
 * 用户状态
 */
export default userSocialStatus;
