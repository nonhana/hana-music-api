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

const TaskPointDetail = UpstreamObject({
  progressRate: Loose(Schema.Finite),
  rewardExtendInfo: Loose(Schema.String),
  rewardId: Loose(Schema.Finite),
  rewardType: Loose(Schema.Finite),
  sortValue: Loose(Schema.Finite),
  stageType: Loose(Schema.Finite),
  status: Loose(Schema.Finite),
  sumTarget: Loose(Schema.Finite),
  times: Loose(Schema.Finite),
  userMissionId: Loose(Schema.Finite),
  value: Loose(Schema.Finite),
  worth: Loose(Schema.Finite),
});

const TaskExtInfo = UpstreamObject({
  missionCode: Loose(Schema.String),
});

const Task = UpstreamObject({
  taskId: Schema.Finite,
  actionType: Loose(Schema.Finite),
  completed: Loose(Schema.Boolean),
  completedPoint: Loose(Schema.Finite),
  extInfoMap: Loose(TaskExtInfo),
  link: Loose(Schema.String),
  linkText: Loose(Schema.String),
  period: Loose(Schema.Finite),
  position: Loose(Schema.Finite),
  status: Loose(Schema.Finite),
  subAction: Loose(Schema.String),
  targetPoint: Loose(Schema.Finite),
  targetUserTaskId: Loose(Schema.Finite),
  taskDescription: Loose(Schema.String),
  taskName: Loose(Schema.String),
  taskPoint: Loose(Schema.Finite),
  taskPointDetail: Loose(Schema.Array(TaskPointDetail)),
  taskType: Loose(Schema.String),
  userTaskId: Loose(Schema.Finite),
  webPicUrl: Loose(Schema.String),
});

// 返回码、任务列表路径 `data` 及每个任务的编号 `taskId` 收紧；任务说明、图标、链接和奖励明细宽松，
// 只见过 null 的图标、`wordsPicUrl` 与目标状态字段未声明。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    data: Schema.Array(Task),
    message: Loose(Schema.String),
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

const yunbeiTasks: ModuleEffect<ModuleInput, ModuleBody> = (query, request) =>
  Effect.gen(function* () {
    const data = {};
    const response = yield* request(
      buildApiRequestIntent(
        `/api/usertool/task/list/all`,
        data,
        createOption(query, 'weapi'),
      ),
    );
    const body = yield* decodeUpstreamBody(
      'yunbei_tasks',
      ModuleBody,
      response,
    );
    return { ...toModuleResponse(response), body };
  });

/**
 * 云贝任务
 */
export default yunbeiTasks;

export { decodeLegacyModuleInput as decodeModuleInput } from '../core/module-input.ts';

export type ModuleInput = LegacyModuleInput;
