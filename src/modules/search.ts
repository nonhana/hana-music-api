import { Effect, Schema } from 'effect';

import { Call } from '../core/call.ts';
import { APP_CONF } from '../core/config.ts';
import {
  decodeModuleInput as decodeInput,
  QueryNumber,
} from '../core/module-input.ts';
import { toModuleResponse } from '../core/response.ts';
import {
  decodeUpstreamBody,
  Loose,
  Optional,
  UpstreamObject,
} from '../core/upstream-body.ts';
import {
  AlbumSummary,
  Artist,
  PlaylistSummary,
  Song,
} from '../core/upstream-schemas.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { PagedQuery, QueryNumberLike } from '../types/module-shared.ts';

export type ModuleInput = PagedQuery & {
  keywords: string;
  type?: QueryNumberLike;
};

const inputSchema = Schema.Struct({
  keywords: Schema.String,
  type: Schema.optional(QueryNumber),
  limit: Schema.optional(QueryNumber),
  offset: Schema.optional(QueryNumber),
});

export const decodeModuleInput = (input: unknown) =>
  decodeInput(inputSchema, input);

// 搜索歌手是记录本身，编号收紧；core 的 `Artist.id` 是宽松的，这里局部覆盖。
const SearchedArtist = UpstreamObject({
  ...Artist.schema.fields,
  id: Schema.Finite,
  appendRecText: Loose(Schema.String),
  fansSize: Loose(Schema.Finite),
  identityIconUrl: Loose(Schema.String),
  recommendText: Loose(Schema.String),
  alg: Loose(Schema.String),
});

const SearchedAlbum = UpstreamObject({
  ...AlbumSummary.schema.fields,
  alg: Loose(Schema.String),
  containedSong: Loose(Schema.String),
});

const SearchedPlaylist = UpstreamObject({
  ...PlaylistSummary.schema.fields,
  action: Loose(Schema.String),
  actionType: Loose(Schema.String),
  alg: Loose(Schema.String),
  bookCount: Loose(Schema.Finite),
  officialTags: Loose(Schema.Array(Schema.String)),
  recommendText: Loose(Schema.String),
});

const SearchedMvArtist = UpstreamObject({
  id: Loose(Schema.Finite),
  name: Loose(Schema.String),
});

const SearchedMv = UpstreamObject({
  id: Schema.Finite,
  alg: Loose(Schema.String),
  artistId: Loose(Schema.Finite),
  artistName: Loose(Schema.String),
  artists: Loose(Schema.Array(SearchedMvArtist)),
  arTransName: Loose(Schema.String),
  cover: Loose(Schema.String),
  duration: Loose(Schema.Finite),
  mark: Loose(Schema.Finite),
  name: Loose(Schema.String),
  playCount: Loose(Schema.Finite),
});

const SearchResult = UpstreamObject({
  songs: Optional(Schema.Array(Song)),
  songCount: Loose(Schema.Finite),
  albums: Optional(Schema.Array(SearchedAlbum)),
  albumCount: Loose(Schema.Finite),
  artists: Optional(Schema.Array(SearchedArtist)),
  artistCount: Loose(Schema.Finite),
  playlists: Optional(Schema.Array(SearchedPlaylist)),
  playlistCount: Loose(Schema.Finite),
  mvs: Optional(Schema.Array(SearchedMv)),
  mvCount: Loose(Schema.Finite),
  hasMore: Loose(Schema.Boolean),
  hlWords: Loose(Schema.Array(Schema.String)),
});

// 通到搜索结果的路径 `result` 按 `type` 只给一类列表（songs/albums/artists/playlists/mvs），没有结果时列表是空数组、null 或整个缺失；type=2000 的语音搜索走 `data` 形状，未收窄，原样保留。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    result: Optional(SearchResult),
    trp: Loose(UpstreamObject({ rules: Loose(Schema.Array(Schema.String)) })),
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

const search: ModuleEffect<ModuleInput, ModuleBody> = (input, request) =>
  Effect.gen(function* () {
    const call = yield* Call;
    const voice = String(input.type ?? '') === '2000';
    const data = voice
      ? {
          keyword: input.keywords,
          scene: 'normal',
          limit: input.limit || 30,
          offset: input.offset || 0,
        }
      : {
          s: input.keywords,
          type: input.type || 1,
          limit: input.limit || 30,
          offset: input.offset || 0,
        };
    const response = yield* request({
      target: voice ? '/api/search/voice/get' : '/api/search/get',
      protocol: call.config.crypto || (APP_CONF.encrypt ? 'eapi' : 'api'),
      method: 'POST',
      headers: {},
      body: JSON.stringify(data),
      response: 'json',
      semantic: 'read',
    });
    const body = yield* decodeUpstreamBody('search', ModuleBody, response);
    return { ...toModuleResponse(response), body };
  });

export default search;
