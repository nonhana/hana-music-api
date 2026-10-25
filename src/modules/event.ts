import { Effect, Schema } from 'effect';

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
import type { LegacyModuleInput } from '../types/legacy.ts';

// 动态记录：只收紧动态自己的编号 `id`；评论信息、用户、图片和计数都是宽松声明。
// `resourceUniqueId` 的类型证据来自 `user_event` 录制；`contentDeclaration`、`repostSource` 在事件列表里出现过空串。
// `adInfo`、`anonymityInfo`、`bottomActivityInfos`、`extJsonInfo` 等扩展块未声明，见模块页的已知例外。
const EventRecord = UpstreamObject({
  id: Schema.Finite,
  actId: Loose(Schema.Finite),
  actName: Loose(Schema.String),
  aiPrivatePic: Loose(Schema.Boolean),
  canShare: Loose(Schema.Boolean),
  containAiContent: Loose(Schema.Boolean),
  contentDeclaration: Loose(Schema.String),
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
  privacySetting: Loose(Schema.Finite),
  relationTopic: Loose(Schema.Boolean),
  repostSource: Loose(Schema.String),
  resourceUniqueId: Loose(Schema.String),
  showFollowButton: Loose(Schema.Boolean),
  showTime: Loose(Schema.Finite),
  songPlayStyle: Loose(Schema.String),
  threadId: Loose(Schema.String),
  tmplId: Loose(Schema.Finite),
  topEvent: Loose(Schema.Boolean),
  type: Loose(Schema.Finite),
  typeDesc: Loose(Schema.String),
  user: Loose(EventUser),
  uuid: Loose(Schema.String),
});

// 获取动态列表：通到列表的路径 `event` 和每条动态自己的编号 `event[].id` 收紧；没有动态时 `event` 为空数组。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    event: Schema.Array(EventRecord),
    lasttime: Loose(Schema.Finite),
    more: Loose(Schema.Boolean),
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

const event: ModuleEffect<ModuleInput, ModuleBody> = (query, request) =>
  Effect.gen(function* () {
    const data = {
      pagesize: query.pagesize || 20,
      lasttime: query.lasttime || -1,
    };
    const response = yield* request(
      buildApiRequestIntent(
        `/api/v1/event/get`,
        data,
        createOption(query, 'weapi'),
      ),
    );
    const body = yield* decodeUpstreamBody('event', ModuleBody, response);
    return { ...toModuleResponse(response), body };
  });

/**
 * 获取动态列表
 */
export default event;

export { decodeLegacyModuleInput as decodeModuleInput } from '../core/module-input.ts';

export type ModuleInput = LegacyModuleInput;
