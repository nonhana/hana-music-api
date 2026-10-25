import { Effect, Schema } from 'effect';

import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import {
  decodeUpstreamBody,
  Loose,
  Optional,
  UpstreamObject,
} from '../core/upstream-body.ts';
import { CommentRecord, CommentUser } from '../core/upstream-schemas.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';

// 历史评论除了 `CommentRecord` 的字段，还带被回复内容/用户和资源信息 `resourceInfo`、`resourceType`、`threadId`。
const HistoryComment = UpstreamObject({
  ...CommentRecord.schema.fields,
  beRepliedContent: Loose(Schema.String),
  beRepliedUser: Loose(CommentUser),
  resourceInfo: Loose(Schema.String),
  resourceType: Loose(Schema.Finite),
  threadId: Loose(Schema.String),
});

const HistoryData = UpstreamObject({
  comments: Optional(Schema.Array(HistoryComment)),
  hotComments: Optional(Schema.Array(HistoryComment)),
  commentCount: Loose(Schema.Finite),
  hasMore: Loose(Schema.Boolean),
  reminder: Loose(Schema.Boolean),
});

// 通到历史评论的路径 `data.comments`、`data.hotComments` 和每条评论的编号 `data.comments[].commentId` 收紧；
// 没有历史评论或未登录时两个数组都是 `null`。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    data: HistoryData,
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

const userCommentHistory: ModuleEffect<ModuleInput, ModuleBody> = (
  query,
  request,
) =>
  Effect.gen(function* () {
    const data = {
      compose_reminder: 'true',
      compose_hot_comment: 'true',
      limit: query.limit || 10,
      user_id: query.uid,
      time: query.time || 0,
    };
    const response = yield* request(
      buildApiRequestIntent(
        `/api/comment/user/comment/history`,
        data,
        createOption(query, 'weapi'),
      ),
    );
    const body = yield* decodeUpstreamBody(
      'user_comment_history',
      ModuleBody,
      response,
    );
    return { ...toModuleResponse(response), body };
  });

export default userCommentHistory;

export { decodeLegacyModuleInput as decodeModuleInput } from '../core/module-input.ts';

export type ModuleInput = LegacyModuleInput;
