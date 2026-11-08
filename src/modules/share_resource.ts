import { Effect } from 'effect';

import type { ModuleActions } from '../core/request-actions.ts';
import { buildActionRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';

export const moduleActions = {
  request: {
    profile: 'eapi',
    target: '/api/share/friends/resource',
    semantic: 'write',
    cache: 'none',
    retry: 'never',
  },
} as const satisfies ModuleActions;

const shareResource: ModuleEffect<ModuleInput> = (query, request) =>
  Effect.gen(function* () {
    const data = {
      type: query.type || 'song', // song,playlist,mv,djprogram,djradio,noresource
      msg: query.msg || '',
      id: query.id || '',
    };
    const response = yield* request(
      buildActionRequestIntent('request', moduleActions['request'], data),
    );
    return toModuleResponse(response);
  });

/**
 * 分享歌曲到动态
 */
export default shareResource;

export { decodeLegacyModuleInput as decodeModuleInput } from '../core/module-input.ts';

export type ModuleInput = LegacyModuleInput;
