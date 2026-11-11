import { Effect, Schema } from 'effect';

import {
  decodeModuleInput as decodeInput,
  NumberId,
  NumberLiterals,
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
  follow: {
    profile: 'web',
    target: { prefix: '/api/user/follow/' },
    semantic: 'write',
    cache: 'none',
    retry: 'never',
  },
  delfollow: {
    profile: 'web',
    target: { prefix: '/api/user/delfollow/' },
    semantic: 'write',
    cache: 'none',
    retry: 'never',
  },
} as const satisfies ModuleActions;

const FollowAction = NumberLiterals([0, 1]);

export type ModuleInput = {
  id: NumberId;
  t: 0 | 1;
};

const inputSchema = Schema.Struct({
  id: NumberId,
  t: FollowAction,
});

export const decodeModuleInput = (input: unknown) =>
  decodeInput(inputSchema, input);

// 接口就是为了确认关注/取关成功：正文顶层的返回码 `code` 收紧；`msg` 是附带提示，宽松。
// 正方向（关注）在录制设备上被上游风控拒绝（code 250），成功正文只有反向（取关）的证据。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    msg: Loose(Schema.String),
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

const follow: ModuleEffect<ModuleInput, ModuleBody, typeof moduleActions> = (
  query,
  request,
) =>
  Effect.gen(function* () {
    const action = query.t === 1 ? 'follow' : 'delfollow';
    const response = yield* request(action, {
      data: {},
      path: `/api/user/${action}/${String(query.id)}`,
    });
    return {
      ...toModuleResponse(response),
      body: yield* decodeUpstreamBody('follow', ModuleBody, response),
    };
  });

/**
 * 关注与取消关注用户
 */
export default follow;
