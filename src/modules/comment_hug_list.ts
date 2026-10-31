import { Effect, Schema } from 'effect';

import { resolveResourceType } from '../core/comment-thread.ts';
import { InvalidModuleInput } from '../core/errors.ts';
import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import {
  decodeUpstreamBody,
  Loose,
  UpstreamObject,
} from '../core/upstream-body.ts';
import {
  CommentRecord,
  CommentReply,
  CommentUser,
} from '../core/upstream-schemas.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';

// 抱一抱列表里的用户比歌曲评论多出 `encryptUserId` 和 `isHug`。
const HugUser = UpstreamObject({
  ...CommentUser.schema.fields,
  encryptUserId: Loose(Schema.String),
  isHug: Loose(Schema.Boolean),
});

const HugReply = UpstreamObject({
  ...CommentReply.schema.fields,
  commentId: Loose(Schema.Finite),
  owner: Loose(Schema.Boolean),
  user: Loose(HugUser),
  voiceDurationMillSecond: Loose(Schema.Finite),
});

// `currentComment` 是被抱评论的附带信息，v2 比歌曲评论多出楼层、视频和隐私字段，编号一并放开。
const HugCurrentComment = UpstreamObject({
  ...CommentRecord.schema.fields,
  beReplied: Loose(Schema.Array(HugReply)),
  commentId: Loose(Schema.Finite),
  commentVideoVO: Loose(
    UpstreamObject({
      allowCreation: Loose(Schema.Boolean),
      forbidCreationText: Loose(Schema.String),
      showCreationEntrance: Loose(Schema.Boolean),
      videoCount: Loose(Schema.Finite),
    }),
  ),
  extInfo: Loose(
    UpstreamObject({
      forwardEvent: Loose(Schema.Finite),
      statistics: Loose(
        UpstreamObject({
          status_60: Loose(Schema.Finite),
        }),
      ),
    }),
  ),
  highlight: Loose(Schema.Boolean),
  privacy: Loose(Schema.Finite),
  repliedMark: Loose(Schema.Boolean),
  replyCount: Loose(Schema.Finite),
  showFloorComment: Loose(
    UpstreamObject({
      replyCount: Loose(Schema.Finite),
      showReplyCount: Loose(Schema.Boolean),
    }),
  ),
  threadId: Loose(Schema.String),
  user: Loose(HugUser),
  userTop: Loose(Schema.Boolean),
  voiceDurationMillSecond: Loose(Schema.Finite),
});

const HugComment = UpstreamObject({
  hugContent: Loose(Schema.String),
  user: Loose(HugUser),
});

// 通到抱一抱列表的路径 `data.hugComments` 收紧；没有抱一抱时它是空数组，`data.currentComment` 是附带信息，其余字段宽松。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    data: UpstreamObject({
      currentComment: Loose(HugCurrentComment),
      hugComments: Schema.Array(HugComment),
      hasMore: Loose(Schema.Boolean),
      cursor: Loose(Schema.String),
      idCursor: Loose(Schema.Finite),
      hugTotalCounts: Loose(Schema.Finite),
    }),
    message: Loose(Schema.String),
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

const commentHugList: ModuleEffect<ModuleInput, ModuleBody> = (
  input,
  request,
) =>
  Effect.gen(function* () {
    const query = { ...input };
    if (
      query.sid !== undefined &&
      query.sid !== null &&
      typeof query.sid !== 'string' &&
      typeof query.sid !== 'number' &&
      typeof query.sid !== 'boolean'
    ) {
      return yield* new InvalidModuleInput({
        message: 'sid must be a primitive value',
      });
    }
    const resourceType = resolveResourceType(query.type);
    const threadId = `${resourceType}${String(query.sid ?? '')}`;
    const data = {
      targetUserId: query.uid,
      commentId: query.cid,
      cursor: query.cursor || '-1',
      threadId,
      pageNo: query.page || 1,
      idCursor: query.idCursor || -1,
      pageSize: query.pageSize || 100,
    };
    const response = yield* request(
      buildApiRequestIntent(
        `/api/v2/resource/comments/hug/list`,
        data,
        createOption(query),
      ),
    );
    const body = yield* decodeUpstreamBody(
      'comment_hug_list',
      ModuleBody,
      response,
    );
    return { ...toModuleResponse(response), body };
  });

export default commentHugList;

export { decodeLegacyModuleInput as decodeModuleInput } from '../core/module-input.ts';

export type ModuleInput = LegacyModuleInput;
