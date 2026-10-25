import { Effect, Schema } from 'effect';

import {
  decodeModuleInput as decodeInput,
  QueryIdentifier as Identifier,
} from '../core/module-input.ts';
import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import {
  decodeUpstreamBody,
  Loose,
  UpstreamObject,
} from '../core/upstream-body.ts';
import { Artist, Song } from '../core/upstream-schemas.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { IdentifierQuery } from '../types/module-shared.ts';

export type ModuleInput = IdentifierQuery;

const inputSchema = Schema.Struct({
  id: Identifier,
});

export const decodeModuleInput = (input: unknown) =>
  decodeInput(inputSchema, input);

const ArtistSummary = UpstreamObject({
  ...Artist.schema.fields,
  publishTime: Loose(Schema.Finite),
});

// 通到热门歌曲列表的路径和每首歌的编号收紧；歌手是附带信息，其余字段宽松。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    artist: Loose(ArtistSummary),
    hotSongs: Schema.Array(Song),
    more: Loose(Schema.Boolean),
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

const artists: ModuleEffect<ModuleInput, ModuleBody> = (query, request) =>
  Effect.gen(function* () {
    const response = yield* request(
      buildApiRequestIntent(
        `/api/v1/artist/${query.id}`,
        {},
        createOption(query, 'weapi'),
      ),
    );
    const body = yield* decodeUpstreamBody('artists', ModuleBody, response);
    return { ...toModuleResponse(response), body };
  });

/**
 * 歌手单曲
 */
export default artists;
