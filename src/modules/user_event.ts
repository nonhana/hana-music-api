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

  lasttime?: QueryNumberLike;
};

const inputSchema = Schema.Struct({
  uid: Identifier,
  limit: Schema.optional(QueryNumber),
  offset: Schema.optional(QueryNumber),
  lasttime: Schema.optional(QueryNumber),
});

export const decodeModuleInput = (input: unknown) =>
  decodeInput(inputSchema, input);

// 动态里的用户是附带对象，`userId` 宽松；`urlAnalyze`、`vipRights` 是 `UserProfile` 之外的字段。
const EventUser = UpstreamObject({
  ...UserProfile.schema.fields,
  userId: Loose(Schema.Finite),
  urlAnalyze: Loose(Schema.Boolean),
  vipRights: Loose(VipRights),
});

const EventIpLocation = UpstreamObject({
  location: Loose(Schema.String),
});

const EventPic = UpstreamObject({
  format: Loose(Schema.String),
  height: Loose(Schema.Finite),
  width: Loose(Schema.Finite),
  mute: Loose(Schema.Boolean),
  originUrl: Loose(Schema.String),
  originIdStr: Loose(Schema.String),
  originJpgIdStr: Loose(Schema.String),
  pcRectangleUrl: Loose(Schema.String),
  pcSquareUrl: Loose(Schema.String),
  rectangleUrl: Loose(Schema.String),
  squareUrl: Loose(Schema.String),
  videoDurationMs: Loose(Schema.Finite),
});

const EventResourceInfo = UpstreamObject({
  id: Loose(Schema.Finite),
  userId: Loose(Schema.Finite),
  name: Loose(Schema.String),
  resourceType: Loose(Schema.Finite),
  eventType: Loose(Schema.Finite),
  artistId: Loose(Schema.Finite),
  artistAreaCode: Loose(Schema.Finite),
});

// `s` 是点赞用户编号，`t` 是点赞时间（上游字段名就是缩写）。
const EventLikedUser = UpstreamObject({
  s: Loose(Schema.Finite),
  t: Loose(Schema.Finite),
});

const EventCommentThread = UpstreamObject({
  id: Loose(Schema.String),
  resourceId: Loose(Schema.Finite),
  resourceInfo: Loose(EventResourceInfo),
  resourceOwnerId: Loose(Schema.Finite),
  resourceTitle: Loose(Schema.String),
  resourceType: Loose(Schema.Finite),
  commentCount: Loose(Schema.Finite),
  floorCommentCount: Loose(Schema.Finite),
  likedCount: Loose(Schema.Finite),
  latestLikedUsers: Loose(Schema.Array(EventLikedUser)),
  shareCount: Loose(Schema.Finite),
  hotCount: Loose(Schema.Finite),
});

// 动态的评论信息：`commentThread` 指向这条动态的评论串；动态正文在记录的 `json` 字符串里。
const EventInfo = UpstreamObject({
  commentThread: Loose(EventCommentThread),
  commentCount: Loose(Schema.Finite),
  likedCount: Loose(Schema.Finite),
  shareCount: Loose(Schema.Finite),
  liked: Loose(Schema.Boolean),
  resourceId: Loose(Schema.Finite),
  resourceType: Loose(Schema.Finite),
  threadId: Loose(Schema.String),
});

// 用户动态记录：只收紧动态自己的编号 `id`；评论信息、用户、图片和计数都是宽松声明。
const EventRecord = UpstreamObject({
  id: Schema.Finite,
  actId: Loose(Schema.Finite),
  actName: Loose(Schema.String),
  aiPrivatePic: Loose(Schema.Boolean),
  canShare: Loose(Schema.Boolean),
  containAiContent: Loose(Schema.Boolean),
  discussId: Loose(Schema.String),
  encryptUserId: Loose(Schema.String),
  eventTime: Loose(Schema.Finite),
  expireTime: Loose(Schema.Finite),
  extType: Loose(Schema.String),
  firstEditTime: Loose(Schema.Finite),
  forwardCount: Loose(Schema.Finite),
  info: Loose(EventInfo),
  insiteForwardCount: Loose(Schema.Finite),
  ipLocation: Loose(EventIpLocation),
  json: Loose(Schema.String),
  more: Loose(Schema.Boolean),
  musicianSay: Loose(Schema.Boolean),
  needAiDefaultPic: Loose(Schema.Boolean),
  owner: Loose(Schema.Boolean),
  pics: Loose(Schema.Array(EventPic)),
  relationTopic: Loose(Schema.Boolean),
  resourceUniqueId: Loose(Schema.String),
  showFollowButton: Loose(Schema.Boolean),
  showTime: Loose(Schema.Finite),
  songPlayStyle: Loose(Schema.String),
  threadId: Loose(Schema.String),
  tmplId: Loose(Schema.Finite),
  type: Loose(Schema.Finite),
  typeDesc: Loose(Schema.String),
  user: Loose(EventUser),
});

// 通到动态列表的路径 `events` 和每条动态自己的编号 `events[].id` 收紧；没有动态时数组为空。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    events: Schema.Array(EventRecord),
    lasttime: Loose(Schema.Finite),
    more: Loose(Schema.Boolean),
    size: Loose(Schema.Finite),
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

const userEvent: ModuleEffect<ModuleInput, ModuleBody> = (query, request) =>
  Effect.gen(function* () {
    const data = {
      getcounts: true,
      time: query.lasttime || -1,
      limit: query.limit || 30,
      total: false,
    };
    const response = yield* request(
      buildApiRequestIntent(
        `/api/event/get/${query.uid}`,
        data,
        createOption(query),
      ),
    );
    const body = yield* decodeUpstreamBody('user_event', ModuleBody, response);
    return { ...toModuleResponse(response), body };
  });

/**
 * 用户动态
 */
export default userEvent;
