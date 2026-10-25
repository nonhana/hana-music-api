import { Effect, Schema } from 'effect';

import { resolveResourceType } from '../core/comment-thread.ts';
import {
  decodeModuleInput as decodeInput,
  QueryBoolean,
  QueryIdentifier,
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
import { CommentRecord, CommentUser } from '../core/upstream-schemas.ts';
import type { ModuleEffect } from '../types/index.ts';
import type {
  IdentifierQuery,
  QueryBooleanLike,
  QueryNumberLike,
} from '../types/module-shared.ts';

export type ModuleInput = IdentifierQuery & {
  type: QueryNumberLike;

  cursor?: string;
  pageNo?: QueryNumberLike;
  pageSize?: QueryNumberLike;
  showInner?: QueryBooleanLike;
  sortType?: QueryNumberLike;
};

const inputSchema = Schema.Struct({
  id: QueryIdentifier,
  type: QueryNumber,
  cursor: Schema.optional(Schema.String),
  pageNo: Schema.optional(QueryNumber),
  pageSize: Schema.optional(QueryNumber),
  showInner: Schema.optional(QueryBoolean),
  sortType: Schema.optional(QueryNumber),
});

export const decodeModuleInput = (input: unknown) =>
  decodeInput(inputSchema, input).pipe(
    Effect.map((query) => ({
      ...query,
      showInner:
        query.showInner === undefined ||
        query.showInner === true ||
        query.showInner === 1 ||
        query.showInner === '1' ||
        query.showInner === 'true',
    })),
  );

const NewVipRight = UpstreamObject({
  iconUrl: Loose(Schema.String),
  rights: Loose(Schema.Boolean),
  vipCode: Loose(Schema.Finite),
});

const NewVipLogo = UpstreamObject({
  logoDto: Loose(
    UpstreamObject({
      actionUrl: Loose(Schema.String),
      height: Loose(Schema.Finite),
      interestId: Loose(Schema.Finite),
      logoType: Loose(Schema.Finite),
      url: Loose(Schema.String),
      width: Loose(Schema.Finite),
    }),
  ),
  vipType: Loose(Schema.Finite),
});

const NewVipRights = UpstreamObject({
  associator: Loose(NewVipRight),
  extInfo: Loose(UpstreamObject({ logo: Loose(NewVipLogo) })),
  musicPackage: Loose(NewVipRight),
  redplus: Loose(NewVipRight),
  redVipAnnualCount: Loose(Schema.Finite),
  redVipLevel: Loose(Schema.Finite),
  relationType: Loose(Schema.Finite),
});

// v2 评论里的用户比歌曲评论多出 `encryptUserId`、`isHug` 和会员角标的 `extInfo.logo`。
const NewCommentUser = UpstreamObject({
  ...CommentUser.schema.fields,
  encryptUserId: Loose(Schema.String),
  isHug: Loose(Schema.Boolean),
  vipRights: Loose(NewVipRights),
});

// v2 评论比歌曲评论多出楼层、扩展信息和视频字段；`commentId` 是记录自己的编号，保持收紧。
const NewComment = UpstreamObject({
  ...CommentRecord.schema.fields,
  args: Loose(Schema.String),
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
      authorRepliedIds: Loose(Schema.Array(Schema.Finite)),
      forwardEvent: Loose(Schema.Finite),
      repliedByAuthorCount: Loose(Schema.String),
      statistics: Loose(
        UpstreamObject({
          ext_dislike: Loose(Schema.Finite),
          status_60: Loose(Schema.Finite),
          status_80: Loose(Schema.Finite),
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
  track: Loose(Schema.String),
  user: Loose(NewCommentUser),
  userTop: Loose(Schema.Boolean),
  voiceDurationMillSecond: Loose(Schema.Finite),
});

const NewSortType = UpstreamObject({
  sortType: Loose(Schema.Finite),
  sortTypeName: Loose(Schema.String),
  target: Loose(Schema.String),
});

const NewLikeAnimation = UpstreamObject({
  version: Loose(Schema.Finite),
});

// 通到 v2 评论列表的路径 `data.comments` 和每条评论的编号 `data.comments[].commentId` 收紧；资源没有评论时 `data.comments` 是空数组，其余字段宽松。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    message: Loose(Schema.String),
    data: UpstreamObject({
      comments: Schema.Array(NewComment),
      commentsTitle: Loose(Schema.String),
      currentCommentTitle: Loose(Schema.String),
      cursor: Loose(Schema.String),
      expandCount: Loose(Schema.Finite),
      hasMore: Loose(Schema.Boolean),
      likeAnimation: Loose(NewLikeAnimation),
      newReplyExpGroupName: Loose(Schema.String),
      sortType: Loose(Schema.Finite),
      sortTypeList: Loose(Schema.Array(NewSortType)),
      style: Loose(Schema.String),
      totalCount: Loose(Schema.Finite),
    }),
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

const commentNew: ModuleEffect<ModuleInput, ModuleBody> = (query, request) =>
  Effect.gen(function* () {
    const resourceType = resolveResourceType(query.type);
    const threadId = `${resourceType}${String(query.id)}`;
    const pageSize = Number(query.pageSize ?? 20) || 20;
    const pageNo = Number(query.pageNo ?? 1) || 1;
    let sortType = Number(query.sortType) || 99;
    if (sortType === 1) {
      sortType = 99;
    }
    let cursor = '';
    switch (sortType) {
      case 99:
        cursor = String((pageNo - 1) * pageSize);
        break;
      case 2:
        cursor = 'normalHot#' + String((pageNo - 1) * pageSize);
        break;
      case 3:
        cursor = query.cursor || '0';
        break;
      default:
        break;
    }
    const data = {
      threadId,
      pageNo,
      showInner: query.showInner ?? true,
      pageSize,
      cursor,
      sortType, //99:按推荐排序,2:按热度排序,3:按时间排序
    };
    const response = yield* request(
      buildApiRequestIntent(
        `/api/v2/resource/comments`,
        data,
        createOption(query),
      ),
    );
    const body = yield* decodeUpstreamBody('comment_new', ModuleBody, response);
    return { ...toModuleResponse(response), body };
  });

/**
 * 评论
 */
export default commentNew;
