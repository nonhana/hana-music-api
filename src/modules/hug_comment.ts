import { Effect, Schema } from 'effect';

import { resolveResourceType } from '../core/comment-thread.ts';
import {
  decodeModuleInput as decodeInput,
  NaturalValue,
  NumberId,
} from '../core/module-input.ts';
import type { ModuleActions } from '../core/request-actions.ts';
import { toModuleResponse } from '../core/response.ts';
import type { ModuleEffect } from '../types/index.ts';
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

export type ModuleInput = {
  uid: NumberId;
  cid: NumberId;
  sid: NumberId;
  type?: number;
};

const inputSchema = Schema.Struct({
  uid: NumberId,
  cid: NumberId,
  sid: NumberId,
  type: Schema.optional(NaturalValue),
});

export const decodeModuleInput = (input: unknown) =>
  decodeInput(inputSchema, input);

const hugComment: ModuleEffect<
  ModuleInput,
  UnknownJson,
  typeof moduleActions
> = (query, request) =>
  Effect.gen(function* () {
    const resourceType = resolveResourceType(query.type);
    const threadId = `${resourceType}${String(query.sid)}`;
    const data = {
      targetUserId: query.uid,
      commentId: query.cid,
      threadId,
    };
    const response = yield* request('request', { data });
    return toModuleResponse(response);
  });

export default hugComment;
