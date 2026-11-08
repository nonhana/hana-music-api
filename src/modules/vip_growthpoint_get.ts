import { Effect } from 'effect';

import type { ModuleActions } from '../core/request-actions.ts';
import { buildActionRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';

export const moduleActions = {
  request: {
    profile: 'weapiPc',
    target: '/api/vipnewcenter/app/level/task/reward/get',
    semantic: 'write',
    cache: 'none',
    retry: 'never',
  },
} as const satisfies ModuleActions;

const vipGrowthpointGet: ModuleEffect<ModuleInput> = (query, request) =>
  Effect.gen(function* () {
    const data = {
      taskIds: query.ids,
    };
    const response = yield* request(
      buildActionRequestIntent('request', moduleActions['request'], data),
    );
    return toModuleResponse(response);
  });

/**
 * 领取会员成长值
 */
export default vipGrowthpointGet;

export { decodeLegacyModuleInput as decodeModuleInput } from '../core/module-input.ts';

export type ModuleInput = LegacyModuleInput;
