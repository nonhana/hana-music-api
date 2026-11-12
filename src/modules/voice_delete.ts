import { Effect, Schema } from 'effect';

import {
  decodeModuleInput as decodeInput,
  NumberIdList,
} from '../core/module-input.ts';
import type { ModuleActions } from '../core/request-actions.ts';
import { toModuleResponse } from '../core/response.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { UnknownJson } from '../types/unknown.ts';

export const moduleActions = {
  request: {
    profile: 'eapi',
    target: '/api/content/voice/delete',
    semantic: 'write',
    cache: 'none',
    retry: 'never',
  },
} as const satisfies ModuleActions;

export type ModuleInput = { ids: NumberIdList };

const inputSchema = Schema.Struct({ ids: NumberIdList });

export const decodeModuleInput = (input: unknown) =>
  decodeInput(inputSchema, input);

const voiceDelete: ModuleEffect<
  ModuleInput,
  UnknownJson,
  typeof moduleActions
> = (input, request) =>
  Effect.gen(function* () {
    const data = {
      ids: JSON.stringify(input.ids),
    };
    const response = yield* request('request', { data });
    return toModuleResponse(response);
  });

export default voiceDelete;
