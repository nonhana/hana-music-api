import { Effect, Schema } from 'effect';

import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import {
  decodeUpstreamBody,
  Loose,
  UpstreamObject,
} from '../core/upstream-body.ts';
import { UserProfile } from '../core/upstream-schemas.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';

// 消息双方的资料是附带信息，`userId` 不在松紧判断里，全部字段按 `UserProfile` 宽松声明；
// `expertTags` 的类型证据来自同形用户资料（`msg_private`、`msg_recentcontact`）。
const MessageUser = UpstreamObject({
  ...UserProfile.schema.fields,
  userId: Loose(Schema.Finite),
  expertTags: Loose(Schema.Array(Schema.String)),
});

const MessageRecord = UpstreamObject({
  id: Schema.Finite,
  batchId: Loose(Schema.Finite),
  fromUser: Loose(MessageUser),
  msg: Loose(Schema.String),
  time: Loose(Schema.Finite),
  toUser: Loose(MessageUser),
});

// 通到私信内容的路径 `msgs` 和每条私信自己的编号 `msgs[].id` 收紧；私信正文、双方资料和时间宽松。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    msgs: Schema.Array(MessageRecord),
    hint: Loose(Schema.String),
    isArtist: Loose(Schema.Boolean),
    isSubed: Loose(Schema.Boolean),
    more: Loose(Schema.Boolean),
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

const msgPrivateHistory: ModuleEffect<ModuleInput, ModuleBody> = (
  query,
  request,
) =>
  Effect.gen(function* () {
    const data = {
      userId: query.uid,
      limit: query.limit || 30,
      time: query.before || 0,
      total: 'true',
    };
    const response = yield* request(
      buildApiRequestIntent(
        `/api/msg/private/history`,
        data,
        createOption(query, 'weapi'),
      ),
    );
    const body = yield* decodeUpstreamBody(
      'msg_private_history',
      ModuleBody,
      response,
    );
    return { ...toModuleResponse(response), body };
  });

/**
 * 私信内容
 */
export default msgPrivateHistory;

export { decodeLegacyModuleInput as decodeModuleInput } from '../core/module-input.ts';

export type ModuleInput = LegacyModuleInput;
