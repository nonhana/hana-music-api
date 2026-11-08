import { Effect, Schema } from 'effect';

import { resolveResourceType } from '../core/comment-thread.ts';
import {
  decodeModuleInput as decodeInput,
  QueryIdentifier as Identifier,
  QueryNumber,
} from '../core/module-input.ts';
import type { ModuleActions } from '../core/request-actions.ts';
import { buildActionRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import type { ModuleEffect } from '../types/index.ts';
import type {
  IdentifierQuery,
  QueryIdentifier,
  QueryNumberLike,
} from '../types/module-shared.ts';

export const moduleActions = {
  add: {
    profile: 'weapiPc',
    target: '/api/resource/comments/add',
    semantic: 'write',
    cache: 'none',
    retry: 'never',
  },
  delete: {
    profile: 'weapiPc',
    target: '/api/resource/comments/delete',
    semantic: 'write',
    cache: 'none',
    retry: 'never',
  },
  reply: {
    profile: 'weapiPc',
    target: '/api/resource/comments/reply',
    semantic: 'write',
    cache: 'none',
    retry: 'never',
  },
} as const satisfies ModuleActions;

export type ModuleInput = IdentifierQuery & {
  type: QueryNumberLike;

  commentId?: QueryIdentifier;
  content?: string;
  t: 0 | 1 | 2 | '0' | '1' | '2';
  threadId?: string;
};

const inputSchema = Schema.Struct({
  id: Identifier,
  type: QueryNumber,
  commentId: Schema.optional(Identifier),
  content: Schema.optional(Schema.String),
  t: Schema.Literals([0, 1, 2, '0', '1', '2']),
  threadId: Schema.optional(Schema.String),
});

export const decodeModuleInput = (input: unknown) =>
  decodeInput(inputSchema, input);

const comment: ModuleEffect<ModuleInput> = (query, request) =>
  Effect.gen(function* () {
    const actionMap: Record<number, 'add' | 'delete' | 'reply'> = {
      1: 'add',
      0: 'delete',
      2: 'reply',
    };
    const action = actionMap[Number(query.t ?? 0)] ?? 'add';
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
    const response = yield* request(
      buildActionRequestIntent(
        action,
        moduleActions[action],
        data,
        `/api/resource/comments/${action}`,
      ),
    );
    return toModuleResponse(response);
  });

/**
 * 发送与删除评论
 */
export default comment;
