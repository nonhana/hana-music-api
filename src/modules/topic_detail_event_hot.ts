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
// `resourceUniqueId` 的类型证据来自 `user_event` 录制；事件记录的证据按三份录制并集取证。
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

// 获取话题热门动态：通到列表的路径 `events` 和每条动态自己的编号 `events[].id` 收紧；没有热门动态时 `events` 为空数组。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    events: Schema.Array(EventRecord),
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

const topicDetailEventHot: ModuleEffect<ModuleInput, ModuleBody> = (
  query,
  request,
) =>
  Effect.gen(function* () {
    const data = {
      actid: query.actid,
    };
    const response = yield* request(
      buildApiRequestIntent(
        `/api/act/event/hot`,
        data,
        createOption(query, 'weapi'),
      ),
    );
    const body = yield* decodeUpstreamBody(
      'topic_detail_event_hot',
      ModuleBody,
      response,
    );
    return { ...toModuleResponse(response), body };
  });

export default topicDetailEventHot;

export { decodeLegacyModuleInput as decodeModuleInput } from '../core/module-input.ts';

export type ModuleInput = LegacyModuleInput;
