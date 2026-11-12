import { Effect, Schema } from 'effect';

import {
  decodeModuleInput as decodeInput,
  NaturalValue,
  NumberId,
} from '../core/module-input.ts';
import type { ModuleActions } from '../core/request-actions.ts';
import { toModuleResponse } from '../core/response.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { UnknownJson } from '../types/unknown.ts';

export const moduleActions = {
  request: {
    profile: 'web',
    target: '/api/nmusician/workbench/mission/reward/obtain/new',
    semantic: 'write',
    cache: 'none',
    retry: 'never',
  },
} as const satisfies ModuleActions;

export type ModuleInput = {
  id: NumberId;
  period: NaturalValue;
};

const inputSchema = Schema.Struct({
  id: NumberId,
  period: NaturalValue,
});

export const decodeModuleInput = (input: unknown) =>
  decodeInput(inputSchema, input);

const musicianCloudbeanObtain: ModuleEffect<
  ModuleInput,
  UnknownJson,
  typeof moduleActions
> = (query, request) =>
  Effect.gen(function* () {
    const data = {
      userMissionId: query.id,
      period: query.period,
    };
    const response = yield* request('request', { data });
    return toModuleResponse(response);
  });

/**
 * 领取云豆
 */
export default musicianCloudbeanObtain;
