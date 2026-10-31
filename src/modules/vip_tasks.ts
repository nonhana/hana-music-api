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

const TaskItem = UpstreamObject({
  taskId: Schema.String,
  action: Loose(Schema.String),
  actionType: Loose(Schema.Finite),
  basicTaskId: Loose(Schema.Finite),
  currentProgress: Loose(Schema.Finite),
  description: Loose(Schema.String),
  growthPoint: Loose(Schema.Finite),
  iconUrl: Loose(Schema.String),
  missionId: Loose(Schema.Finite),
  name: Loose(Schema.String),
  needReceive: Loose(Schema.Boolean),
  period: Loose(Schema.Finite),
  progressType: Loose(Schema.Finite),
  ruleId: Loose(Schema.Finite),
  seqTag: Loose(Schema.Finite),
  showProgress: Loose(Schema.Boolean),
  sortValue: Loose(Schema.Finite),
  status: Loose(Schema.Finite),
  tagId: Loose(Schema.Finite),
  targetWorth: Loose(Schema.Finite),
  taskTag: Loose(Schema.String),
  totalUngetScore: Loose(Schema.Finite),
  type: Loose(Schema.Finite),
  updateTime: Loose(Schema.Finite),
  url: Loose(Schema.String),
});

const TaskGroup = UpstreamObject({
  taskItems: Schema.Array(TaskItem),
  seq: Loose(Schema.Finite),
  seqName: Loose(Schema.String),
  taskType: Loose(Schema.Finite),
});

// 返回码、任务页的路径 `data`、任务分组 `data.taskList`、组内任务 `taskItems` 及任务的 `taskId` 收紧；本批只录到一条任务，`taskId` 为字符串，其余字段宽松。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    data: UpstreamObject({
      taskList: Schema.Array(TaskGroup),
      taskScore: Loose(Schema.Finite),
    }),
    message: Loose(Schema.String),
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

const vipTasks: ModuleEffect<ModuleInput, ModuleBody> = (query, request) =>
  Effect.gen(function* () {
    const data = {};
    const response = yield* request(
      buildApiRequestIntent(
        `/api/vipnewcenter/app/level/task/list`,
        data,
        createOption(query, 'weapi'),
      ),
    );
    const body = yield* decodeUpstreamBody('vip_tasks', ModuleBody, response);
    return { ...toModuleResponse(response), body };
  });

/**
 * 会员任务
 */
export default vipTasks;

export { decodeLegacyModuleInput as decodeModuleInput } from '../core/module-input.ts';

export type ModuleInput = LegacyModuleInput;
