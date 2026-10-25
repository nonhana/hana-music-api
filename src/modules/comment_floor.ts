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
  QueryIdentifier,
  QueryNumberLike,
} from '../types/module-shared.ts';

export type ModuleInput = IdentifierQuery & {
  type: QueryNumberLike;

  limit?: QueryNumberLike;
  parentCommentId: QueryIdentifier;
  time?: QueryNumberLike;
};

const inputSchema = Schema.Struct({
  id: Identifier,
  type: QueryNumber,
  limit: Schema.optional(QueryNumber),
  parentCommentId: Identifier,
  time: Schema.optional(QueryNumber),
});

export const decodeModuleInput = (input: unknown) =>
  decodeInput(inputSchema, input);

// 父评论在 `ownerComment` 里是附带信息，编号也放开。
const LooseCommentRecord = UpstreamObject({
  ...CommentRecord.schema.fields,
  commentId: Loose(Schema.Finite),
});

// 通到楼层回复列表的路径 `data.comments` 和每条回复的编号 `data.comments[].commentId` 收紧；没有楼层时 `data.comments` 是空数组，其余字段宽松。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    message: Loose(Schema.String),
    data: UpstreamObject({
      comments: Schema.Array(CommentRecord),
      ownerComment: Loose(LooseCommentRecord),
      hasMore: Loose(Schema.Boolean),
      totalCount: Loose(Schema.Finite),
      time: Loose(Schema.Finite),
    }),
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

const commentFloor: ModuleEffect<ModuleInput, ModuleBody> = (query, request) =>
  Effect.gen(function* () {
    const resourceType = resolveResourceType(query.type);
    const data = {
      parentCommentId: query.parentCommentId,
      threadId: `${resourceType}${String(query.id)}`,
      time: query.time || -1,
      limit: query.limit || 20,
    };
    const response = yield* request(
      buildApiRequestIntent(
        `/api/resource/comment/floor/get`,
        data,
        createOption(query, 'weapi'),
      ),
    );
    const body = yield* decodeUpstreamBody(
      'comment_floor',
      ModuleBody,
      response,
    );
    return { ...toModuleResponse(response), body };
  });

export default commentFloor;
