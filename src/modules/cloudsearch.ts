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
import { AlbumSummary, Artist, Song } from '../core/upstream-schemas.ts';
import type { ModuleEffect } from '../types/index.ts';

const SearchedArtist = UpstreamObject({
  ...Artist.schema.fields,
  id: Schema.Finite,
});

const SearchedPlaylist = UpstreamObject({
  id: Schema.Finite,
  name: Loose(Schema.String),
  coverImgUrl: Loose(Schema.String),
  trackCount: Loose(Schema.Finite),
  playCount: Loose(Schema.Finite),
  creator: Loose(
    UpstreamObject({
      userId: Loose(Schema.Finite),
      nickname: Loose(Schema.String),
      authStatus: Loose(Schema.Finite),
      avatarUrl: Loose(Schema.String),
      userType: Loose(Schema.Finite),
    }),
  ),
  bookCount: Loose(Schema.Finite),
  description: Loose(Schema.String),
  highQuality: Loose(Schema.Boolean),
  officialPlaylistTitle: Loose(Schema.String),
  playlistType: Loose(Schema.String),
  specialType: Loose(Schema.Finite),
  subscribed: Loose(Schema.Boolean),
  userId: Loose(Schema.Finite),
});

// 按 type 只给一类结果（songs/albums/artists/playlists，各带总数；没有结果时列表缺失或是 null），这些列表可以没有，出现了就按记录编号收紧校验，其余字段宽松。
export const ModuleBody = /* @__PURE__ */ defineModuleBody(
  UpstreamObject({
    code: Schema.Literal(200),
    result: UpstreamObject({
      songs: Song.pipe(Schema.Array, Optional),
      songCount: Loose(Schema.Finite),
      albums: AlbumSummary.pipe(Schema.Array, Optional),
      albumCount: Loose(Schema.Finite),
      artists: SearchedArtist.pipe(Schema.Array, Optional),
      artistCount: Loose(Schema.Finite),
      playlists: SearchedPlaylist.pipe(Schema.Array, Optional),
      playlistCount: Loose(Schema.Finite),
    }),
    trp: Loose(
      UpstreamObject({
        rules: Schema.String.pipe(Schema.Array, Loose),
      }),
    ),
  }),
);
export type ModuleBody = BodyType<typeof ModuleBody>;

export const moduleActions = {
  read: {
    target: '/api/cloudsearch/pc',
    profile: 'web',
    semantic: 'read',
    cache: 'none',
    retry: 'connect',
  },
} as const satisfies ModuleActions;

export type ModuleInput = {
  keywords: string;
  limit?: number;
  offset?: number;
  type?: 1 | 10 | 100 | 1000 | 1002 | 1004 | 1006 | 1009 | 1014 | 1018 | 2000;
};

const inputSchema = Schema.Struct({
  keywords: Schema.String,
  limit: Schema.optional(NaturalValue),
  offset: Schema.optional(NaturalValue),
  type: Schema.optional(
    NumberLiterals([
      1, 10, 100, 1000, 1002, 1004, 1006, 1009, 1014, 1018, 2000,
    ]),
  ),
});

export const decodeModuleInput = (input: unknown) =>
  decodeInput(inputSchema, input);

const cloudsearch: ModuleEffect<
  ModuleInput,
  ModuleBody,
  typeof moduleActions
> = (query, request) =>
  Effect.gen(function* () {
    const data = {
      s: query.keywords,
      type: query.type || 1, // 1: 单曲, 10: 专辑, 100: 歌手, 1000: 歌单, 1002: 用户, 1004: MV, 1006: 歌词, 1009: 电台, 1014: 视频
      limit: query.limit || 30,
      offset: query.offset || 0,
      total: true,
    };
    const response = yield* request('read', { data });
    const body = yield* decodeUpstreamBody('cloudsearch', ModuleBody, response);
    return {
      ...toModuleResponse(response),
      body,
    };
  });

/**
 * 搜索
 */
export default cloudsearch;
