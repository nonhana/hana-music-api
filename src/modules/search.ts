import * as Effect from 'effect/Effect';
import * as Schema from 'effect/Schema';

import {
  decodeModuleInput as decodeInput,
  NaturalValue,
  NumberLiterals,
} from '../core/module-input.ts';
import type { ModuleActions } from '../core/request-actions.ts';
import { toModuleResponse } from '../core/response.ts';
import type { BodyType } from '../core/upstream-body.ts';
import {
  decodeUpstreamBody,
  defineModuleBody,
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

// 文档列全了搜索类型；`2000` 的声音搜索走独立上游接口。数值字符串由 decoder 归一为数字。
const SEARCH_TYPES = [
  1, 10, 100, 1000, 1002, 1004, 1006, 1009, 1014, 1018, 2000,
] as const;

export type ModuleInput = {
  keywords: string;
  limit?: NaturalValue;
  offset?: NaturalValue;
  type?: (typeof SEARCH_TYPES)[number];
};

const inputSchema = Schema.Struct({
  keywords: Schema.String,
  limit: Schema.optional(NaturalValue),
  offset: Schema.optional(NaturalValue),
  type: Schema.optional(NumberLiterals(SEARCH_TYPES)),
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
  officialTags: Schema.String.pipe(Schema.Array, Loose),
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
  artists: SearchedMvArtist.pipe(Schema.Array, Loose),
  arTransName: Loose(Schema.String),
  cover: Loose(Schema.String),
  duration: Loose(Schema.Finite),
  mark: Loose(Schema.Finite),
  name: Loose(Schema.String),
  playCount: Loose(Schema.Finite),
});

const SearchResult = UpstreamObject({
  songs: Song.pipe(Schema.Array, Optional),
  songCount: Loose(Schema.Finite),
  albums: SearchedAlbum.pipe(Schema.Array, Optional),
  albumCount: Loose(Schema.Finite),
  artists: SearchedArtist.pipe(Schema.Array, Optional),
  artistCount: Loose(Schema.Finite),
  playlists: SearchedPlaylist.pipe(Schema.Array, Optional),
  playlistCount: Loose(Schema.Finite),
  mvs: SearchedMv.pipe(Schema.Array, Optional),
  mvCount: Loose(Schema.Finite),
  hasMore: Loose(Schema.Boolean),
  hlWords: Schema.String.pipe(Schema.Array, Loose),
});

// 通到搜索结果的路径 `result` 按 `type` 只给一类列表（songs/albums/artists/playlists/mvs），没有结果时列表是空数组、null 或整个缺失；type=2000 的语音搜索走 `data` 形状，未收窄，原样保留。
export const ModuleBody = /* @__PURE__ */ defineModuleBody(
  UpstreamObject({
    code: Schema.Literal(200),
    result: Optional(SearchResult),
    trp: Loose(
      UpstreamObject({ rules: Schema.String.pipe(Schema.Array, Loose) }),
    ),
  }),
);
export type ModuleBody = BodyType<typeof ModuleBody>;

export const moduleActions = {
  read: {
    target: '/api/search/get',
    profile: 'eapi',
    semantic: 'read',
    cache: 'shared',
    retry: 'read',
  },
  voice: {
    target: '/api/search/voice/get',
    profile: 'web',
    semantic: 'read',
    cache: 'shared',
    retry: 'read',
  },
} as const satisfies ModuleActions;

const search: ModuleEffect<ModuleInput, ModuleBody, typeof moduleActions> = (
  input,
  request,
) =>
  Effect.gen(function* () {
    const voice = input.type === 2000;
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
    const action = voice ? 'voice' : 'read';
    const response = yield* request(action, { data });
    const body = yield* decodeUpstreamBody('search', ModuleBody, response);
    return { ...toModuleResponse(response), body };
  });

export default search;
