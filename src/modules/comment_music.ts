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
  Optional,
  UpstreamObject,
} from '../core/upstream-body.ts';
import { CommentRecord } from '../core/upstream-schemas.ts';
import type { ModuleEffect } from '../types/index.ts';
import type {
  IdentifierPagedQuery,
  QueryNumberLike,
} from '../types/module-shared.ts';

export type ModuleInput = IdentifierPagedQuery & {
  before?: QueryNumberLike;
};

const inputSchema = Schema.Struct({
  id: Identifier,
  limit: Schema.optional(QueryNumber),
  offset: Schema.optional(QueryNumber),
  before: Schema.optional(QueryNumber),
});

export const decodeModuleInput = (input: unknown) =>
  decodeInput(inputSchema, input);

// 通到评论列表的路径 `comments`、`hotComments` 和每条评论的编号 `comments[].commentId` 收紧；越界分页时 `hotComments` 整个缺失，其余字段宽松。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    comments: Schema.Array(CommentRecord),
    hotComments: Optional(Schema.Array(CommentRecord)),
    cnum: Loose(Schema.Finite),
    isMusician: Loose(Schema.Boolean),
    more: Loose(Schema.Boolean),
    moreHot: Loose(Schema.Boolean),
    total: Loose(Schema.Finite),
    userId: Loose(Schema.Finite),
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

const commentMusic: ModuleEffect<ModuleInput, ModuleBody> = (query, request) =>
  Effect.gen(function* () {
    const data = {
      rid: query.id,
      limit: query.limit || 20,
      offset: query.offset || 0,
      beforeTime: query.before || 0,
    };
    const response = yield* request(
      buildApiRequestIntent(
        `/api/v1/resource/comments/R_SO_4_${query.id}`,
        data,
        createOption(query, 'weapi'),
      ),
    );
    const body = yield* decodeUpstreamBody(
      'comment_music',
      ModuleBody,
      response,
    );
    return { ...toModuleResponse(response), body };
  });

/**
 * 歌曲评论
 */
export default commentMusic;
