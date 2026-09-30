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

export type ArtistSongsOrder = 'hot' | 'time' | (string & {});

export type ModuleInput = IdentifierQuery & {
  limit?: QueryNumberLike;
  offset?: QueryNumberLike;

  order?: ArtistSongsOrder;
};

const inputSchema = Schema.Struct({
  id: Identifier,
  limit: Schema.optional(QueryNumber),
  offset: Schema.optional(QueryNumber),
  order: Schema.optional(
    Schema.Union([
      Schema.Literal('hot'),
      Schema.Literal('time'),
      Schema.String,
    ]),
  ),
});

export const decodeModuleInput = (input: unknown) =>
  decodeInput(inputSchema, input);

const artistSongs: ModuleEffect<ModuleInput> = (query, request) =>
  Effect.gen(function* () {
    const data = {
      id: query.id,
      private_cloud: 'true',
      work_type: 1,
      order: query.order || 'hot', //hot,time
      offset: query.offset || 0,
      limit: query.limit || 100,
    };
    return toModuleResponse(
      yield* request(
        buildApiRequestIntent(
          `/api/v1/artist/songs`,
          data,
          createOption(query),
        ),
      ),
    );
  });

export default artistSongs;
