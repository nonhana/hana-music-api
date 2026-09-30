import { Effect, Schema } from 'effect';

import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import type { ModuleEffect } from '../types/index.ts';
import type {
  IdentifierQuery,
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

  before?: QueryNumberLike;
  limit?: QueryNumberLike;
  offset?: QueryNumberLike;
};

const inputSchema = Schema.Struct({
  id: Identifier,
  type: QueryNumber,
  before: Schema.optional(QueryNumber),
  limit: Schema.optional(QueryNumber),
  offset: Schema.optional(QueryNumber),
});

export const decodeModuleInput = (input: unknown) =>
  decodeInput(inputSchema, input);

const commentHot: ModuleEffect<ModuleInput> = (query, request) =>
  Effect.gen(function* () {
    const resourceType = resolveResourceType(query.type);
    const data = {
      rid: query.id,
      limit: query.limit || 20,
      offset: query.offset || 0,
      beforeTime: query.before || 0,
    };
    return toModuleResponse(
      yield* request(
        buildApiRequestIntent(
          `/api/v1/resource/hotcomments/${resourceType}${String(query.id)}`,
          data,
          createOption(query, 'weapi'),
        ),
      ),
    );
  });

/**
 * 热门评论
 */
export default commentHot;
