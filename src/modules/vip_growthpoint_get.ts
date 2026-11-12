import { Effect, Schema } from 'effect';

import { decodeModuleInput as decodeInput } from '../core/module-input.ts';
import type { ModuleActions } from '../core/request-actions.ts';
import { toModuleResponse } from '../core/response.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { UnknownJson } from '../types/unknown.ts';

// 领取任务奖励的 `ids` 来自 vip_tasks 的 `unGetIds`，每项是上游任务标识；逗号列表由 SDK 编码。
const TaskRewardId = Schema.String.check(
  Schema.isMinLength(1),
  Schema.isPattern(/^[^,]+$/u),
);

export type ModuleInput = { ids: ReadonlyArray<string> };

const inputSchema = Schema.Struct({
  ids: Schema.Array(TaskRewardId).check(Schema.isMinLength(1)),
});

export const decodeModuleInput = (input: unknown) =>
  decodeInput(inputSchema, input);

export const moduleActions = {
  request: {
    profile: 'web',
    target: '/api/vipnewcenter/app/level/task/reward/get',
    semantic: 'write',
    cache: 'none',
    retry: 'never',
  },
} as const satisfies ModuleActions;

const vipGrowthpointGet: ModuleEffect<
  ModuleInput,
  UnknownJson,
  typeof moduleActions
> = (query, request) =>
  Effect.gen(function* () {
    const data = {
      taskIds: query.ids.join(','),
    };
    const response = yield* request('request', { data });
    return toModuleResponse(response);
  });

/**
 * 领取会员成长值
 */
export default vipGrowthpointGet;
