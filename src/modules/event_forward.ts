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
    profile: 'web',
    target: '/api/event/forward',
    semantic: 'write',
    cache: 'none',
    retry: 'never',
  },
} as const satisfies ModuleActions;

export type ModuleInput = {
  uid: NumberId;
  evId: NumberId;
  forwards?: string;
};

const inputSchema = Schema.Struct({
  uid: NumberId,
  evId: NumberId,
  forwards: Schema.optional(Schema.String),
});

export const decodeModuleInput = (input: unknown) =>
  decodeInput(inputSchema, input);

const eventForward: ModuleEffect<
  ModuleInput,
  UnknownJson,
  typeof moduleActions
> = (query, request) =>
  Effect.gen(function* () {
    const data = {
      forwards: query.forwards,
      id: query.evId,
      eventUserId: query.uid,
    };
    const response = yield* request('request', { data });
    return toModuleResponse(response);
  });

/**
 * 转发动态
 */
export default eventForward;
