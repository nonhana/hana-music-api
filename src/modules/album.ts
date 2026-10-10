import { Effect, Schema } from 'effect';

import {
  decodeModuleInput as decodeInput,
  QueryIdentifier as Identifier,
} from '../core/module-input.ts';
import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import { decodeUpstreamBody, UpstreamObject } from '../core/upstream-body.ts';
import { Artist, Song } from '../core/upstream-schemas.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { IdentifierQuery } from '../types/module-shared.ts';

export type ModuleInput = IdentifierQuery;

const inputSchema = Schema.Struct({
  id: Identifier,
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
  description: Schema.String,
});

export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    songs: Schema.Array(Song),
    album: Album,
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

const album: ModuleEffect<ModuleInput, ModuleBody> = (query, request) =>
  Effect.gen(function* () {
    const response = yield* request(
      buildApiRequestIntent(
        `/api/v1/album/${query.id}`,
        {},
        createOption(query, 'weapi'),
      ),
    );
    const body = yield* decodeUpstreamBody('album', ModuleBody, response);
    return {
      ...toModuleResponse(response),
      body,
    };
  });

/**
 * 专辑内容
 */
export default album;
