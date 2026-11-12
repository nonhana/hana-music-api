import { Effect, Schema } from 'effect';

import {
  decodeModuleInput as decodeInput,
  NumberId,
} from '../core/module-input.ts';
import type { ModuleActions } from '../core/request-actions.ts';
import { toModuleResponse } from '../core/response.ts';
import type { ModuleEffect } from '../types/index.ts';
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

export type ModuleInput = { id: NumberId };

const inputSchema = Schema.Struct({ id: NumberId });

export const decodeModuleInput = (input: unknown) =>
  decodeInput(inputSchema, input);

const voiceDetail: ModuleEffect<
  ModuleInput,
  UnknownJson,
  typeof moduleActions
> = (input, request) =>
  Effect.gen(function* () {
    const data = {
      id: input.id,
    };
    const response = yield* request('request', { data });
    return toModuleResponse(response);
  });

export default voiceDetail;
