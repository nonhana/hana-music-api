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

  limit?: QueryNumberLike;
  parentCommentId: QueryIdentifier;
  time?: QueryNumberLike;
};

const inputSchema = Schema.Struct({
  id: Identifier,
  type: QueryNumber,
  limit: Schema.optional(QueryNumber),
  parentCommentId: Identifier,
  time: Schema.optional(QueryNumber),
});

export const decodeModuleInput = (input: unknown) =>
  decodeInput(inputSchema, input);

const commentFloor: ModuleEffect<ModuleInput> = (query, request) =>
  Effect.gen(function* () {
    const resourceType = resolveResourceType(query.type);
    const data = {
      parentCommentId: query.parentCommentId,
      threadId: `${resourceType}${String(query.id)}`,
      time: query.time || -1,
      limit: query.limit || 20,
    };
    return toModuleResponse(
      yield* request(
        buildApiRequestIntent(
          `/api/resource/comment/floor/get`,
          data,
          createOption(query, 'weapi'),
        ),
      ),
    );
  });

export default commentFloor;
