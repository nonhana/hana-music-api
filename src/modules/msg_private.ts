import { Effect, Schema } from 'effect';

import {
  decodeModuleInput as decodeInput,
  NaturalValue,
} from '../core/module-input.ts';
import type { ModuleActions } from '../core/request-actions.ts';
import { toModuleResponse } from '../core/response.ts';
import {
  decodeUpstreamBody,
  Loose,
  UpstreamObject,
} from '../core/upstream-body.ts';
import { UserProfile } from '../core/upstream-schemas.ts';
import type { ModuleEffect } from '../types/index.ts';

export type ModuleInput = { limit?: NaturalValue; offset?: NaturalValue };

const inputSchema = Schema.Struct({
  limit: Schema.optional(NaturalValue),
  offset: Schema.optional(NaturalValue),
});

export const decodeModuleInput = (input: unknown) =>
  decodeInput(inputSchema, input);

export const moduleActions = {
  request: {
    profile: 'web',
    target: '/api/msg/private/users',
    semantic: 'read',
    cache: 'none',
    retry: 'never',
  },
} as const satisfies ModuleActions;

// 会话双方的资料是附带信息，`userId` 不在松紧判断里，全部字段按 `UserProfile` 宽松声明。
const MessageUser = UpstreamObject({
  ...UserProfile.schema.fields,
  userId: Loose(Schema.Finite),
  expertTags: Loose(Schema.Array(Schema.String)),
});

// `user` 是会话摘要，`user.id` 是会话键（不是用户 id）；双方用户资料在 `fromUser`/`toUser`。
const ConversationSummary = UpstreamObject({
  id: Schema.Finite,
  fromUserId: Loose(Schema.Finite),
  lastMsg: Loose(Schema.String),
  lastMsgTime: Loose(Schema.Finite),
  msgCount: Loose(Schema.Finite),
  newMsgCount: Loose(Schema.Finite),
  toUserId: Loose(Schema.Finite),
});

const Conversation = UpstreamObject({
  user: ConversationSummary,
  fromUser: Loose(MessageUser),
  toUser: Loose(MessageUser),
  lastMsg: Loose(Schema.String),
  lastMsgId: Loose(Schema.Finite),
  lastMsgTime: Loose(Schema.Finite),
  msgSenderType: Loose(Schema.Finite),
  newMsgCount: Loose(Schema.Finite),
  noticeAccountFlag: Loose(Schema.Boolean),
});

// 通到私信会话列表的路径 `msgs` 和每个会话自己的编号 `msgs[].user.id` 收紧；会话双方和最后一条消息宽松。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    msgs: Schema.Array(Conversation),
    more: Loose(Schema.Boolean),
    newMsgCount: Loose(Schema.Finite),
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

const msgPrivate: ModuleEffect<
  ModuleInput,
  ModuleBody,
  typeof moduleActions
> = (query, request) =>
  Effect.gen(function* () {
    const data = {
      offset: query.offset || 0,
      limit: query.limit || 30,
      total: 'true',
    };
    const response = yield* request('request', { data });
    const body = yield* decodeUpstreamBody('msg_private', ModuleBody, response);
    return { ...toModuleResponse(response), body };
  });

/**
 * 私信
 */
export default msgPrivate;
