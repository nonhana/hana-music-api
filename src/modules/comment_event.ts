import { Effect, Schema } from 'effect';

import {
  decodeModuleInput as decodeInput,
  QueryNumber,
} from '../core/module-input.ts';
import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { PagedQuery, QueryNumberLike } from '../types/module-shared.ts';

export type ModuleInput = PagedQuery & {
  before?: QueryNumberLike;
  threadId: string;
};

const inputSchema = Schema.Struct({
  limit: Schema.optional(QueryNumber),
  offset: Schema.optional(QueryNumber),
  before: Schema.optional(QueryNumber),
  threadId: Schema.String,
});

export const decodeModuleInput = (input: unknown) =>
  decodeInput(inputSchema, input);

const commentEvent: ModuleEffect<ModuleInput> = (query, request) =>
  Effect.gen(function* () {
    const data = {
      limit: query.limit || 20,
      offset: query.offset || 0,
      beforeTime: query.before || 0,
    };
    return toModuleResponse(
      yield* request(
        buildApiRequestIntent(
          `/api/v1/resource/comments/${query.threadId}`,
          data,
          createOption(query, 'weapi'),
        ),
      ),
    );
  });

/**
 * 获取动态评论
 */
export default commentEvent;
