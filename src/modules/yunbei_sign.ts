import { Effect } from 'effect';

import type { ModuleActions } from '../core/request-actions.ts';
import { toModuleResponse } from '../core/response.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';
import type { UnknownJson } from '../types/unknown.ts';

export const moduleActions = {
  request: {
    profile: 'web',
    target: '/api/pointmall/user/sign',
    semantic: 'write',
    cache: 'none',
    retry: 'never',
  },
} as const satisfies ModuleActions;

const yunbeiSign: ModuleEffect<
  ModuleInput,
  UnknownJson,
  typeof moduleActions
> = (_query, request) =>
  Effect.gen(function* () {
    const data = {};
    const response = yield* request('request', { data });
    return toModuleResponse(response);
  });

export default yunbeiSign;

export { decodeLegacyModuleInput as decodeModuleInput } from '../core/module-input.ts';

export type ModuleInput = LegacyModuleInput;
