import { Effect, Schema } from 'effect';

import { decodeModuleInput as decodeInput } from '../core/module-input.ts';
import type { ModuleActions } from '../core/request-actions.ts';
import { toModuleResponse } from '../core/response.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { UnknownJson } from '../types/unknown.ts';

export const moduleActions = {
  request: {
    profile: 'web',
    target: '/api/activate/initProfile',
    semantic: 'write',
    cache: 'none',
    retry: 'never',
  },
} as const satisfies ModuleActions;

export type ModuleInput = {
  nickname: string;
};

const inputSchema = Schema.Struct({
  nickname: Schema.String,
});

export const decodeModuleInput = (input: unknown) =>
  decodeInput(inputSchema, input);

const activateInitProfile: ModuleEffect<
  ModuleInput,
  UnknownJson,
  typeof moduleActions
> = (query, request) =>
  Effect.gen(function* () {
    const data = {
      nickname: query.nickname,
    };
    const response = yield* request('request', { data });
    return toModuleResponse(response);
  });

/**
 * 初始化名字
 */
export default activateInitProfile;
