import { Effect } from 'effect';

import type { ModuleActions } from '../core/request-actions.ts';
import { toModuleResponse } from '../core/response.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';
import type { UnknownJson } from '../types/unknown.ts';

export const moduleActions = {
  request: {
    profile: 'eapi',
    target: '/api/msg/private/send',
    semantic: 'write',
    cache: 'none',
    retry: 'never',
  },
} as const satisfies ModuleActions;

const sendText: ModuleEffect<ModuleInput, UnknownJson, typeof moduleActions> = (
  query,
  request,
) =>
  Effect.gen(function* () {
    const data = {
      type: 'text',
      msg: query.msg,
      userIds: '[' + query.user_ids + ']',
    };
    const response = yield* request('request', { data });
    return toModuleResponse(response);
  });

/**
 * 私信
 */
export default sendText;

export { decodeLegacyModuleInput as decodeModuleInput } from '../core/module-input.ts';

export type ModuleInput = LegacyModuleInput;
