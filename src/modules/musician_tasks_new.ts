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

const StageTarget = UpstreamObject({
  progressRate: Loose(Schema.Finite),
  rewardId: Loose(Schema.Finite),
  rewardType: Loose(Schema.Finite),
  sortValue: Loose(Schema.Finite),
  stageType: Loose(Schema.Finite),
  status: Loose(Schema.Finite),
  sumTarget: Loose(Schema.Finite),
  times: Loose(Schema.Finite),
  value: Loose(Schema.Finite),
  worth: Loose(Schema.Finite),
});

const StageMission = UpstreamObject({
  missionId: Schema.Finite,
  actionType: Loose(Schema.Finite),
  business: Loose(Schema.String),
  button: Loose(Schema.String),
  description: Loose(Schema.String),
  endTime: Loose(Schema.Finite),
  extendInfo: Loose(Schema.String),
  hasSendWorth: Loose(Schema.Finite),
  missionEntityId: Loose(Schema.Finite),
  needToReceive: Loose(Schema.Finite),
  period: Loose(Schema.Finite),
  platform: Loose(Schema.Finite),
  progressRate: Loose(Schema.Finite),
  rewardId: Loose(Schema.Finite),
  sortValue: Loose(Schema.Finite),
  startTime: Loose(Schema.Finite),
  status: Loose(Schema.Finite),
  subAction: Loose(Schema.String),
  tag: Loose(Schema.Finite),
  type: Loose(Schema.Finite),
  updateTime: Loose(Schema.Finite),
  userId: Loose(Schema.Finite),
  userStageTargetList: Loose(Schema.Array(StageTarget)),
});

// 返回码、任务列表 `data.list` 和每个任务的编号 `data.list[].missionId` 收紧；
// 阶段目标 `userStageTargetList` 是任务记录里套着的展示数据，整列宽松，坏一条只丢这一列。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    data: UpstreamObject({
      list: Schema.Array(StageMission),
    }),
    message: Loose(Schema.String),
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

const musicianTasksNew: ModuleEffect<ModuleInput, ModuleBody> = (
  query,
  request,
) =>
  Effect.gen(function* () {
    const data = {};
    const response = yield* request(
      buildApiRequestIntent(
        `/api/nmusician/workbench/mission/stage/list `,
        data,
        createOption(query, 'weapi'),
      ),
    );
    const body = yield* decodeUpstreamBody(
      'musician_tasks_new',
      ModuleBody,
      response,
    );
    return { ...toModuleResponse(response), body };
  });

/**
 * 获取音乐人任务
 */
export default musicianTasksNew;

export { decodeLegacyModuleInput as decodeModuleInput } from '../core/module-input.ts';

export type ModuleInput = LegacyModuleInput;
