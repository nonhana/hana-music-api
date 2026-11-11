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

export type ModuleInput = {
  userTaskId: NumberId;
  depositCode?: NaturalValue;
};

const inputSchema = Schema.Struct({
  userTaskId: NumberId,
  depositCode: Schema.optional(NaturalValue),
});

export const decodeModuleInput = (input: unknown) =>
  decodeInput(inputSchema, input);

export const moduleActions = {
  request: {
    profile: 'web',
    target: '/api/usertool/task/point/receive',
    semantic: 'write',
    cache: 'none',
    retry: 'never',
  },
} as const satisfies ModuleActions;

const yunbeiTaskFinish: ModuleEffect<
  ModuleInput,
  UnknownJson,
  typeof moduleActions
> = (query, request) =>
  Effect.gen(function* () {
    const data = {
      userTaskId: query.userTaskId,
      depositCode: String(query.depositCode ?? 0),
    };
    const response = yield* request('request', { data });
    return toModuleResponse(response);
  });

export default yunbeiTaskFinish;
