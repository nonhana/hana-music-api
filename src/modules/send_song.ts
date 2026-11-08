import { Effect } from 'effect';

import type { ModuleActions } from '../core/request-actions.ts';
import { buildActionRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';

export const moduleActions = {
  request: {
    profile: 'eapi',
    target: '/api/msg/private/send',
    semantic: 'write',
    cache: 'none',
    retry: 'never',
  },
} as const satisfies ModuleActions;

const sendSong: ModuleEffect<ModuleInput> = (query, request) =>
  Effect.gen(function* () {
    const data = {
      id: query.id,
      msg: query.msg || '',
      type: 'song',
      userIds: '[' + query.user_ids + ']',
    };
    const response = yield* request(
      buildActionRequestIntent('request', moduleActions['request'], data),
    );
    return toModuleResponse(response);
  });

/**
 * 私信歌曲
 */
export default sendSong;

export { decodeLegacyModuleInput as decodeModuleInput } from '../core/module-input.ts';

export type ModuleInput = LegacyModuleInput;
