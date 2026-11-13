import { Effect, Schema } from 'effect';

import {
  decodeModuleInput as decodeInput,
  NaturalValue,
  NumberId,
} from '../core/module-input.ts';
import type { ModuleActions } from '../core/request-actions.ts';
import { toModuleResponse } from '../core/response.ts';
import {
  decodeUpstreamBody,
  Loose,
  UpstreamObject,
} from '../core/upstream-body.ts';
import { UserProfile, VipRights } from '../core/upstream-schemas.ts';
import type { ModuleEffect } from '../types/index.ts';

export const moduleActions = {
  request: {
    profile: 'web',
    target: '/api/user/getfolloweds/',
    semantic: 'read',
    cache: 'none',
    retry: 'connect',
  },
} as const satisfies ModuleActions;

export type ModuleInput = {
  uid: NumberId;
  limit?: number;
  offset?: number;
};

const inputSchema = Schema.Struct({
  uid: NumberId,
  limit: Schema.optional(NaturalValue),
  offset: Schema.optional(NaturalValue),
});

export const decodeModuleInput = (input: unknown) =>
  decodeInput(inputSchema, input);

// 粉丝记录是附带的用户资料，只有 `userId` 是这条记录自己的编号；`py`、`time`、`vipRights`
// 是粉丝列表特有字段，其余字段复用 `UserProfile`。
const Follower = UpstreamObject({
  ...UserProfile.schema.fields,
  py: Loose(Schema.String),
  time: Loose(Schema.Finite),
  vipRights: Loose(VipRights),
});

// 通到粉丝列表的路径 `followeds` 和每条记录的编号 `followeds[].userId` 收紧；没有粉丝时数组为空。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    followeds: Schema.Array(Follower),
    more: Loose(Schema.Boolean),
    newCount: Loose(Schema.Finite),
    size: Loose(Schema.Finite),
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

const userFolloweds: ModuleEffect<
  ModuleInput,
  ModuleBody,
  typeof moduleActions
> = (query, request) =>
  Effect.gen(function* () {
    const data = {
      userId: query.uid,
      time: '0',
      limit: query.limit || 30,
      offset: query.offset || 0,
      getcounts: 'true',
    };
    const response = yield* request('request', {
      data,
    });
    const body = yield* decodeUpstreamBody(
      'user_followeds',
      ModuleBody,
      response,
    );
    return { ...toModuleResponse(response), body };
  });

/**
 * 关注TA的人(粉丝)
 */
export default userFolloweds;
