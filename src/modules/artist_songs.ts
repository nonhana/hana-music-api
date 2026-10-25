import { Effect, Schema } from 'effect';

import {
  decodeModuleInput as decodeInput,
  QueryIdentifier as Identifier,
  QueryNumber,
} from '../core/module-input.ts';
import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import {
  decodeUpstreamBody,
  Loose,
  UpstreamObject,
} from '../core/upstream-body.ts';
import { Song } from '../core/upstream-schemas.ts';
import type { ModuleEffect } from '../types/index.ts';
import type {
  IdentifierQuery,
  QueryNumberLike,
} from '../types/module-shared.ts';

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

const NoCopyrightMvInfoVideo = UpstreamObject({
  check: Loose(Schema.Boolean),
  container: Loose(Schema.String),
  duration: Loose(Schema.Finite),
  height: Loose(Schema.Finite),
  md5: Loose(Schema.String),
  size: Loose(Schema.Finite),
  tag: Loose(Schema.String),
  width: Loose(Schema.Finite),
});

const NoCopyrightRcmd = UpstreamObject({
  expInfo: Loose(
    UpstreamObject({
      mvPlay: Loose(Schema.Boolean),
    }),
  ),
  mvInfo: Loose(
    UpstreamObject({
      id: Loose(Schema.Finite),
      pic16v9Url: Loose(Schema.String),
      pic4v3: Loose(Schema.Finite),
      type: Loose(Schema.String),
      videos: Loose(Schema.Array(NoCopyrightMvInfoVideo)),
    }),
  ),
  type: Loose(Schema.Finite),
  typeDesc: Loose(Schema.String),
});

const ArtistSong = UpstreamObject({
  ...Song.schema.fields,
  noCopyrightRcmd: Loose(NoCopyrightRcmd),
  eq: Loose(Schema.String),
});

// 通到歌手单曲列表的路径 `songs` 和每首歌的编号收紧；`more`、`total` 是分页信息，宽松。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    songs: Schema.Array(ArtistSong),
    more: Loose(Schema.Boolean),
    total: Loose(Schema.Finite),
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

const artistSongs: ModuleEffect<ModuleInput, ModuleBody> = (query, request) =>
  Effect.gen(function* () {
    const data = {
      id: query.id,
      private_cloud: 'true',
      work_type: 1,
      order: query.order || 'hot', //hot,time
      offset: query.offset || 0,
      limit: query.limit || 100,
    };
    const response = yield* request(
      buildApiRequestIntent(`/api/v1/artist/songs`, data, createOption(query)),
    );
    const body = yield* decodeUpstreamBody(
      'artist_songs',
      ModuleBody,
      response,
    );
    return { ...toModuleResponse(response), body };
  });

export default artistSongs;
