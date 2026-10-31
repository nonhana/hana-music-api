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

const TodoTask = UpstreamObject({
  userTaskId: Schema.Finite,
  completed: Loose(Schema.Boolean),
  depositCode: Loose(Schema.Finite),
  expireTime: Loose(Schema.Finite),
  link: Loose(Schema.String),
  period: Loose(Schema.Finite),
  taskName: Loose(Schema.String),
  taskPoint: Loose(Schema.Finite),
});

// 返回码、待办任务列表路径 `data` 及每个任务的编号 `userTaskId`（任务未开始时为 0）收紧；
// 任务名、奖励和链接宽松。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    data: Schema.Array(TodoTask),
    message: Loose(Schema.String),
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

const yunbeiTasksTodo: ModuleEffect<ModuleInput, ModuleBody> = (
  query,
  request,
) =>
  Effect.gen(function* () {
    const data = {};
    const response = yield* request(
      buildApiRequestIntent(
        `/api/usertool/task/todo/query`,
        data,
        createOption(query, 'weapi'),
      ),
    );
    const body = yield* decodeUpstreamBody(
      'yunbei_tasks_todo',
      ModuleBody,
      response,
    );
    return { ...toModuleResponse(response), body };
  });

/**
 * 云贝待办任务
 */
export default yunbeiTasksTodo;

export { decodeLegacyModuleInput as decodeModuleInput } from '../core/module-input.ts';

export type ModuleInput = LegacyModuleInput;
