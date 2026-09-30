import { Effect, Schema } from 'effect';

import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import type { ModuleEffect } from '../types/index.ts';
import type {
  IdentifierQuery,
  QueryIdentifier,
  QueryNumberLike,
} from '../types/module-shared.ts';
import {
  decodeModuleInput as decodeInput,
  QueryIdentifier as Identifier,
  QueryNumber,
} from './_input.ts';
import { resolveResourceType } from './comment/resource-type.ts';

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
    const actionMap: Record<number, string> = {
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
    return toModuleResponse(
      yield* request(
        buildApiRequestIntent(
          `/api/resource/comments/${action}`,
          data,
          createOption(query, 'weapi'),
        ),
      ),
    );
  });

/**
 * 发送与删除评论
 */
export default comment;
