import { Effect } from 'effect';

import { resolveResourceType } from '../core/comment-thread.ts';
import { InvalidModuleInput } from '../core/errors.ts';
import type { ModuleActions } from '../core/request-actions.ts';
import { toModuleResponse } from '../core/response.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';
import type { UnknownJson } from '../types/unknown.ts';

export const moduleActions = {
  request: {
    profile: 'eapi',
    target: '/api/v2/resource/comments/hug/listener',
    semantic: 'write',
    cache: 'none',
    retry: 'never',
  },
} as const satisfies ModuleActions;

const hugComment: ModuleEffect<
  ModuleInput,
  UnknownJson,
  typeof moduleActions
> = (input, request) =>
  Effect.gen(function* () {
    const query = { ...input };
    if (
      query.sid !== undefined &&
      query.sid !== null &&
      typeof query.sid !== 'string' &&
      typeof query.sid !== 'number' &&
      typeof query.sid !== 'boolean'
    ) {
      return yield* InvalidModuleInput.make({
        message: 'sid must be a primitive value',
      });
    }
    const resourceType = resolveResourceType(query.type);
    const threadId = `${resourceType}${String(query.sid ?? '')}`;
    const data = {
      targetUserId: query.uid,
      commentId: query.cid,
      threadId,
    };
    const response = yield* request('request', { data });
    return toModuleResponse(response);
  });

export default hugComment;

export { decodeLegacyModuleInput as decodeModuleInput } from '../core/module-input.ts';

export type ModuleInput = LegacyModuleInput;
