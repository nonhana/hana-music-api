import { Effect, Schema } from 'effect';

import {
  decodeModuleInput as decodeInput,
  QueryIdentifier as Identifier,
  QueryNumber,
} from '../core/module-input.ts';
import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import { decodeUpstreamBody, UpstreamObject } from '../core/upstream-body.ts';
import { Artist } from '../core/upstream-schemas.ts';
import type { ModuleEffect } from '../types/index.ts';
import type {
  IdentifierQuery,
  QueryNumberLike,
} from '../types/module-shared.ts';

export type ModuleInput = IdentifierQuery & {
  limit?: QueryNumberLike;
  offset?: QueryNumberLike;
};

const inputSchema = Schema.Struct({
  id: Identifier,
  limit: Schema.optional(QueryNumber),
  offset: Schema.optional(QueryNumber),
});

export const decodeModuleInput = (input: unknown) =>
  decodeInput(inputSchema, input);

const Album = UpstreamObject({
  id: Schema.Finite,
  name: Schema.String,
  picUrl: Schema.String,
  size: Schema.Finite,
  artist: Artist,
  publishTime: Schema.Finite,
});

export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    hotAlbums: Schema.Array(Album),
    more: Schema.Boolean,
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

const artistAlbum: ModuleEffect<ModuleInput, ModuleBody> = (query, request) =>
  Effect.gen(function* () {
    const data = {
      limit: query.limit || 30,
      offset: query.offset || 0,
      total: true,
    };
    const response = yield* request(
      buildApiRequestIntent(
        `/api/artist/albums/${query.id}`,
        data,
        createOption(query, 'weapi'),
      ),
    );
    const body = yield* decodeUpstreamBody(
      'artist_album',
      ModuleBody,
      response,
    );
    return {
      ...toModuleResponse(response),
      body,
    };
  });

/**
 * 歌手专辑列表
 */
export default artistAlbum;
