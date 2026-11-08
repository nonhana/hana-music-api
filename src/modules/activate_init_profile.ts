import { Effect } from 'effect';

import type { ModuleActions } from '../core/request-actions.ts';
import { buildActionRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';

export const moduleActions = {
  request: {
    profile: 'eapi',
    target: '/api/activate/initProfile',
    semantic: 'write',
    cache: 'none',
    retry: 'never',
  },
} as const satisfies ModuleActions;

const activateInitProfile: ModuleEffect<ModuleInput> = (query, request) =>
  Effect.gen(function* () {
    const data = {
      nickname: query.nickname,
    };
    const response = yield* request(
      buildActionRequestIntent('request', moduleActions['request'], data),
    );
    return toModuleResponse(response);
  });

/**
 * 初始化名字
 */
export default activateInitProfile;

export { decodeLegacyModuleInput as decodeModuleInput } from '../core/module-input.ts';

export type ModuleInput = LegacyModuleInput;
