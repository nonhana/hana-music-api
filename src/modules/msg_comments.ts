import { Effect, Schema } from 'effect';

import { InvalidModuleInput } from '../core/errors.ts';
import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import {
  decodeUpstreamBody,
  Loose,
  UpstreamObject,
} from '../core/upstream-body.ts';
import { CommentRecord, CommentUser } from '../core/upstream-schemas.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';

// 评论和回复里的用户记录在 `CommentUser` 之外还带 `experts`（字符串到字符串的对象）。
const ReceivedCommentUser = UpstreamObject({
  ...CommentUser.schema.fields,
  experts: Loose(Schema.Record(Schema.String, Schema.String)),
});

// 收到的评论在 `CommentRecord` 之外还带被回复内容、资源位置和评论状态。
const ReceivedComment = UpstreamObject({
  ...CommentRecord.schema.fields,
  beRepliedContent: Loose(Schema.String),
  beRepliedUser: Loose(ReceivedCommentUser),
  combindId: Loose(Schema.String),
  commentExist: Loose(Schema.Boolean),
  commentStatus: Loose(Schema.Finite),
  resourceJson: Loose(Schema.String),
  resourceType: Loose(Schema.Finite),
  subCommentExist: Loose(Schema.Boolean),
  threadId: Loose(Schema.String),
  user: Loose(ReceivedCommentUser),
});

// 通到收到的评论的路径 `comments` 和每条评论自己的编号 `comments[].commentId` 收紧；其余字段宽松。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    comments: Schema.Array(ReceivedComment),
    more: Loose(Schema.Boolean),
    total: Loose(Schema.Finite),
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

const msgComments: ModuleEffect<ModuleInput, ModuleBody> = (query, request) =>
  Effect.gen(function* () {
    if (
      query.uid !== undefined &&
      query.uid !== null &&
      typeof query.uid !== 'string' &&
      typeof query.uid !== 'number' &&
      typeof query.uid !== 'boolean'
    ) {
      return yield* new InvalidModuleInput({
        message: 'uid must be a primitive value',
      });
    }
    const data = {
      beforeTime: query.before || '-1',
      limit: query.limit || 30,
      total: 'true',
      uid: query.uid,
    };
    const response = yield* request(
      buildApiRequestIntent(
        `/api/v1/user/comments/${String(query.uid)}`,
        data,
        createOption(query, 'weapi'),
      ),
    );
    const body = yield* decodeUpstreamBody(
      'msg_comments',
      ModuleBody,
      response,
    );
    return { ...toModuleResponse(response), body };
  });

/**
 * 评论
 */
export default msgComments;

export { decodeLegacyModuleInput as decodeModuleInput } from '../core/module-input.ts';

export type ModuleInput = LegacyModuleInput;
