import { Effect } from 'effect';

import type { ModuleActions } from '../core/request-actions.ts';
import { toModuleResponse } from '../core/response.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';
import type { UnknownJson } from '../types/unknown.ts';

export const moduleActions = {
  request: {
    profile: 'eapi',
    target: '/api/voice/workbench/voice/detail',
    semantic: 'read',
    cache: 'none',
    retry: 'connect',
  },
} as const satisfies ModuleActions;

const voiceDetail: ModuleEffect<
  ModuleInput,
  UnknownJson,
  typeof moduleActions
> = (query, request) =>
  Effect.gen(function* () {
    const data = {
      id: query.id,
    };
    const response = yield* request('request', { data });
    return toModuleResponse(response);
  });

export default voiceDetail;

export { decodeLegacyModuleInput as decodeModuleInput } from '../core/module-input.ts';

export type ModuleInput = LegacyModuleInput;
