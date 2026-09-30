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

  cid: QueryIdentifier;
  t: 0 | 1 | '0' | '1';
  threadId?: string;
};

const inputSchema = Schema.Struct({
  id: Identifier,
  type: QueryNumber,
  cid: Identifier,
  t: Schema.Literals([0, 1, '0', '1']),
  threadId: Schema.optional(Schema.String),
});

export const decodeModuleInput = (input: unknown) =>
  decodeInput(inputSchema, input);

const commentLike: ModuleEffect<ModuleInput> = (query, request) =>
  Effect.gen(function* () {
    const action = Number(query.t) === 1 ? 'like' : 'unlike';
    const resourceType = resolveResourceType(query.type);
    const data: Record<string, unknown> = {
      threadId: `${resourceType}${String(query.id)}`,
      commentId: query.cid,
    };
    if (resourceType === 'A_EV_2_') {
      data.threadId = query.threadId;
    }
    return toModuleResponse(
      yield* request(
        buildApiRequestIntent(
          `/api/v1/comment/${action}`,
          data,
          createOption(query, 'weapi'),
        ),
      ),
    );
  });

/**
 * 点赞与取消点赞评论
 */
export default commentLike;
