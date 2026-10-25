import { Effect, Schema } from 'effect';

import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import {
  decodeUpstreamBody,
  Loose,
  UpstreamObject,
} from '../core/upstream-body.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';

const Mission = UpstreamObject({
  missionId: Schema.Finite,
  actionType: Loose(Schema.Finite),
  business: Loose(Schema.String),
  button: Loose(Schema.String),
  createTime: Loose(Schema.Finite),
  description: Loose(Schema.String),
  endTime: Loose(Schema.Finite),
  extendInfo: Loose(Schema.String),
  jumpLink: Loose(Schema.String),
  missionEntityId: Loose(Schema.Finite),
  name: Loose(Schema.String),
  needToReceive: Loose(Schema.Finite),
  period: Loose(Schema.Finite),
  platform: Loose(Schema.Finite),
  progressRate: Loose(Schema.Finite),
  rewardId: Loose(Schema.Finite),
  rewardType: Loose(Schema.Finite),
  rewardWorth: Loose(Schema.String),
  sortValue: Loose(Schema.Finite),
  startTime: Loose(Schema.Finite),
  status: Loose(Schema.Finite),
  subAction: Loose(Schema.String),
  tag: Loose(Schema.Finite),
  targetCount: Loose(Schema.Finite),
  type: Loose(Schema.Finite),
  updateTime: Loose(Schema.Finite),
  userMissionId: Loose(Schema.Finite),
  userUnObtainRewardExpireTime: Loose(Schema.Finite),
  userId: Loose(Schema.Finite),
  wapLink: Loose(Schema.String),
  wapText: Loose(Schema.String),
  webLink: Loose(Schema.String),
  webText: Loose(Schema.String),
});

// 返回码、任务列表 `data.list` 和每个任务的编号 `data.list[].missionId` 收紧；其余字段宽松。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    data: UpstreamObject({
      list: Schema.Array(Mission),
    }),
    message: Loose(Schema.String),
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

const musicianTasks: ModuleEffect<ModuleInput, ModuleBody> = (query, request) =>
  Effect.gen(function* () {
    const data = {};
    const response = yield* request(
      buildApiRequestIntent(
        `/api/nmusician/workbench/mission/cycle/list`,
        data,
        createOption(query, 'weapi'),
      ),
    );
    const body = yield* decodeUpstreamBody(
      'musician_tasks',
      ModuleBody,
      response,
    );
    return { ...toModuleResponse(response), body };
  });

/**
 * 获取音乐人任务
 */
export default musicianTasks;

export { decodeLegacyModuleInput as decodeModuleInput } from '../core/module-input.ts';

export type ModuleInput = LegacyModuleInput;
