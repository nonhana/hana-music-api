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
import {
  EventInfo,
  EventIpLocation,
  EventPic,
  EventUser,
} from '../core/upstream-schemas.ts';
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
