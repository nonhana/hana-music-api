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

// 关注记录是附带的用户资料，只有 `userId` 是这条记录自己的编号；`py`、`time`、`vipRights`、`expertTags`
// 是关注列表特有或 `UserProfile` 之外的字段，其余字段复用 `UserProfile`。
const FollowUser = UpstreamObject({
  ...UserProfile.schema.fields,
  py: Loose(Schema.String),
  time: Loose(Schema.Finite),
  vipRights: Loose(VipRights),
  expertTags: Loose(Schema.Array(Schema.String)),
});

// 通到关注列表的路径 `follow` 和每条记录的编号 `follow[].userId` 收紧；没有更多关注时数组为空。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    follow: Schema.Array(FollowUser),
    more: Loose(Schema.Boolean),
    touchCount: Loose(Schema.Finite),
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

const userFollows: ModuleEffect<ModuleInput, ModuleBody> = (query, request) =>
  Effect.gen(function* () {
    const data = {
      offset: query.offset || 0,
      limit: query.limit || 30,
      order: true,
    };
    const response = yield* request(
      buildApiRequestIntent(
        `/api/user/getfollows/${query.uid}`,
        data,
        createOption(query, 'weapi'),
      ),
    );
    const body = yield* decodeUpstreamBody(
      'user_follows',
      ModuleBody,
      response,
    );
    return { ...toModuleResponse(response), body };
  });

/**
 * TA关注的人(关注)
 */
export default userFollows;
