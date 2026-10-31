import { Effect, Schema } from 'effect';

import {
  decodeModuleInput as decodeInput,
  QueryIdentifier as Identifier,
  QueryNumber,
} from '../core/module-input.ts';
import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import {
  decodeUpstreamBody,
  Loose,
  UpstreamObject,
} from '../core/upstream-body.ts';
import { UserProfile, VipRights } from '../core/upstream-schemas.ts';
import type { ModuleEffect } from '../types/index.ts';
import type {
  QueryIdentifier,
  QueryNumberLike,
} from '../types/module-shared.ts';

export type ModuleInput = {
  uid: QueryIdentifier;

  limit?: QueryNumberLike;
  offset?: QueryNumberLike;
};

const inputSchema = Schema.Struct({
  uid: Identifier,
  limit: Schema.optional(QueryNumber),
  offset: Schema.optional(QueryNumber),
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

const userFolloweds: ModuleEffect<ModuleInput, ModuleBody> = (query, request) =>
  Effect.gen(function* () {
    const data = {
      userId: query.uid,
      time: '0',
      limit: query.limit || 30,
      offset: query.offset || 0,
      getcounts: 'true',
    };
    const response = yield* request(
      buildApiRequestIntent(
        `/api/user/getfolloweds/${query.uid}`,
        data,
        createOption(query),
      ),
    );
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
