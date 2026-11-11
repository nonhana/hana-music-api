import { Effect, Schema } from 'effect';

import { resolveResourceType } from '../core/comment-thread.ts';
import {
  decodeModuleInput as decodeInput,
  NaturalValue,
  NumberId,
  NumberLiterals,
} from '../core/module-input.ts';
import type { ModuleActions } from '../core/request-actions.ts';
import { toModuleResponse } from '../core/response.ts';
import { decodeUpstreamBody, UpstreamObject } from '../core/upstream-body.ts';
import type { ModuleEffect } from '../types/index.ts';

export const moduleActions = {
  like: {
    profile: 'web',
    target: '/api/resource/like',
    semantic: 'write',
    cache: 'none',
    retry: 'never',
  },
  unlike: {
    profile: 'web',
    target: '/api/resource/unlike',
    semantic: 'write',
    cache: 'none',
    retry: 'never',
  },
} as const satisfies ModuleActions;

const LikeAction = NumberLiterals([0, 1]);

export type ModuleInput = {
  id: NumberId;
  type: number;
  t: 0 | 1;
  threadId?: string;
};

const inputSchema = Schema.Struct({
  id: NumberId,
  type: NaturalValue,
  t: LikeAction,
  threadId: Schema.optional(Schema.String),
});

export const decodeModuleInput = (input: unknown) =>
  decodeInput(inputSchema, input);

// 接口就是为了确认点赞/取消点赞成功：正文只带返回码 `code`，收紧。
// 正方向（点赞）在录制设备上被上游风控拒绝（code 250），成功正文只有反向（取消点赞）的证据。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

const resourceLike: ModuleEffect<
  ModuleInput,
  ModuleBody,
  typeof moduleActions
> = (query, request) =>
  Effect.gen(function* () {
    const action = query.t === 1 ? 'like' : 'unlike';
    const resourceType = resolveResourceType(query.type);
    const data: Record<string, unknown> = {
      threadId: `${resourceType}${String(query.id)}`,
    };
    if (resourceType === 'A_EV_2_') {
      data.threadId = query.threadId;
    }
    const response = yield* request(action, { data });
    return {
      ...toModuleResponse(response),
      body: yield* decodeUpstreamBody('resource_like', ModuleBody, response),
    };
  });

/**
 * 点赞与取消点赞资源
 */
export default resourceLike;
