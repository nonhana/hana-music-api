import { Effect, Schema } from 'effect';

import { resolveResourceType } from '../core/comment-thread.ts';
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
import { CommentRecord } from '../core/upstream-schemas.ts';
import type { ModuleEffect } from '../types/index.ts';
import type {
  IdentifierQuery,
  QueryNumberLike,
} from '../types/module-shared.ts';

export type ModuleInput = IdentifierQuery & {
  type: QueryNumberLike;

  before?: QueryNumberLike;
  limit?: QueryNumberLike;
  offset?: QueryNumberLike;
};

const inputSchema = Schema.Struct({
  id: Identifier,
  type: QueryNumber,
  before: Schema.optional(QueryNumber),
  limit: Schema.optional(QueryNumber),
  offset: Schema.optional(QueryNumber),
});

export const decodeModuleInput = (input: unknown) =>
  decodeInput(inputSchema, input);

// 通到热门评论列表的路径 `hotComments` 和每条评论的编号 `hotComments[].commentId` 收紧；资源没有评论时 `hotComments` 是空数组，其余字段宽松。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    hotComments: Schema.Array(CommentRecord),
    hasMore: Loose(Schema.Boolean),
    total: Loose(Schema.Finite),
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

const commentHot: ModuleEffect<ModuleInput, ModuleBody> = (query, request) =>
  Effect.gen(function* () {
    const resourceType = resolveResourceType(query.type);
    const data = {
      rid: query.id,
      limit: query.limit || 20,
      offset: query.offset || 0,
      beforeTime: query.before || 0,
    };
    const response = yield* request(
      buildApiRequestIntent(
        `/api/v1/resource/hotcomments/${resourceType}${String(query.id)}`,
        data,
        createOption(query, 'weapi'),
      ),
    );
    const body = yield* decodeUpstreamBody('comment_hot', ModuleBody, response);
    return { ...toModuleResponse(response), body };
  });

/**
 * 热门评论
 */
export default commentHot;
