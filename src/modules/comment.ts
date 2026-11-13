import { Effect, Schema } from 'effect';

import { resolveResourceType } from '../core/comment-thread.ts';
import {
  decodeModuleInput as decodeInput,
  NaturalValue,
  NumberId,
  NumberLiterals,
} from '../core/module-input.ts';
import type { ModuleActions } from '../core/request-actions.ts';
import { toModuleResponse } from '../core/response.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { UnknownJson } from '../types/unknown.ts';

export const moduleActions = {
  add: {
    profile: 'web',
    target: '/api/resource/comments/add',
    semantic: 'write',
    cache: 'none',
    retry: 'never',
  },
  delete: {
    profile: 'web',
    target: '/api/resource/comments/delete',
    semantic: 'write',
    cache: 'none',
    retry: 'never',
  },
  reply: {
    profile: 'web',
    target: '/api/v1/resource/comments/reply',
    semantic: 'write',
    cache: 'none',
    retry: 'never',
  },
} as const satisfies ModuleActions;

export type ModuleInput = {
  commentId?: NumberId;
  content?: string;
  id: NumberId;
  t: 0 | 1 | 2;
  threadId?: string;
  type: number;
};

const inputSchema = Schema.Struct({
  commentId: Schema.optional(NumberId),
  content: Schema.optional(Schema.String),
  id: NumberId,
  t: NumberLiterals([0, 1, 2]),
  threadId: Schema.optional(Schema.String),
  type: NaturalValue,
});

export const decodeModuleInput = (input: unknown) =>
  decodeInput(inputSchema, input);

const comment: ModuleEffect<ModuleInput, UnknownJson, typeof moduleActions> = (
  query,
  request,
) =>
  Effect.gen(function* () {
    const action = query.t === 1 ? 'add' : query.t === 2 ? 'reply' : 'delete';
    const resourceType = resolveResourceType(query.type);
    const data: Record<string, unknown> = {
      threadId: `${resourceType}${String(query.id)}`,
    };

    if (resourceType === 'A_EV_2_') {
      data.threadId = query.threadId;
    }
    if (action === 'add') {
      data.content = query.content;
    } else if (action === 'delete') {
      data.commentId = query.commentId;
    } else if (action === 'reply') {
      data.commentId = query.commentId;
      data.content = query.content;
    }
    const response = yield* request(action, { data });
    return toModuleResponse(response);
  });

/**
 * 发送与删除评论
 */
export default comment;
