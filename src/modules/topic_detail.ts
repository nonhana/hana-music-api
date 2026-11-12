import { Effect, Schema } from 'effect';

import {
  decodeModuleInput as decodeInput,
  NumberId,
} from '../core/module-input.ts';
import type { ModuleActions } from '../core/request-actions.ts';
import { toModuleResponse } from '../core/response.ts';
import {
  decodeUpstreamBody,
  Loose,
  UpstreamObject,
} from '../core/upstream-body.ts';
import type { ModuleEffect } from '../types/index.ts';

export type ModuleInput = { actid: NumberId };

const inputSchema = Schema.Struct({ actid: NumberId });

export const decodeModuleInput = (input: unknown) =>
  decodeInput(inputSchema, input);

export const moduleActions = {
  request: {
    profile: 'web',
    target: '/api/act/detail',
    semantic: 'read',
    cache: 'none',
    retry: 'connect',
  },
} as const satisfies ModuleActions;

// 话题详情：`act.actId` 是话题自己的编号；封面、正文和资源 JSON 字符串都是宽松字段。
const Act = UpstreamObject({
  actId: Schema.Finite,
  coverId: Loose(Schema.Finite),
  coverMobileUrl: Loose(Schema.String),
  coverPCId: Loose(Schema.Finite),
  coverPCIdList: Loose(Schema.Finite),
  coverPCIdLong: Loose(Schema.Finite),
  coverPCListUrl: Loose(Schema.String),
  coverPCLongUrl: Loose(Schema.String),
  coverPCUrl: Loose(Schema.String),
  displayType: Loose(Schema.Finite),
  enableResourcePublish: Loose(Schema.Boolean),
  endTime: Loose(Schema.Finite),
  isDefaultImg: Loose(Schema.Boolean),
  meetingBeginTime: Loose(Schema.Finite),
  meetingEndTime: Loose(Schema.Finite),
  participateCount: Loose(Schema.Finite),
  publishTip: Loose(Schema.String),
  resourceJson: Loose(Schema.String),
  resourceType: Loose(Schema.Finite),
  sharePicId: Loose(Schema.Finite),
  sharePicUrl: Loose(Schema.String),
  startTime: Loose(Schema.Finite),
  text: Loose(Schema.Array(Schema.String)),
  title: Loose(Schema.String),
  topicType: Loose(Schema.Finite),
  videoType: Loose(Schema.Finite),
});

// 获取话题详情：通到话题的路径 `act` 和话题自己的编号 `act.actId` 收紧；未知话题由上游返回 code 404。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    act: Act,
    needBeginNotify: Loose(Schema.Boolean),
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

const topicDetail: ModuleEffect<
  ModuleInput,
  ModuleBody,
  typeof moduleActions
> = (query, request) =>
  Effect.gen(function* () {
    const data = {
      actid: query.actid,
    };
    const response = yield* request('request', { data });
    const body = yield* decodeUpstreamBody(
      'topic_detail',
      ModuleBody,
      response,
    );
    return { ...toModuleResponse(response), body };
  });

export default topicDetail;
