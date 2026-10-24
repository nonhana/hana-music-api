import { Effect, Schema } from 'effect';

import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import {
  decodeUpstreamBody,
  Loose,
  Optional,
  UpstreamObject,
} from '../core/upstream-body.ts';
import { AlbumSummary, Artist, Song } from '../core/upstream-schemas.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';

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

// 通到 `result` 的路径、每种结果的编号收紧；结果列表可以没有，其余字段宽松。
// 按 type 只给一类结果：单曲在 songs、专辑在 albums、歌手在 artists、歌单在 playlists，各带结果总数；没有结果时只有总数（0），列表整个缺失或是 null。
// 列表是可以没有的路径：出现了就按记录收紧校验，坏一条报错，不会整列消失。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    result: UpstreamObject({
      songs: Optional(Schema.Array(Song)),
      songCount: Loose(Schema.Finite),
      albums: Optional(Schema.Array(AlbumSummary)),
      albumCount: Loose(Schema.Finite),
      artists: Optional(Schema.Array(SearchedArtist)),
      artistCount: Loose(Schema.Finite),
      playlists: Optional(Schema.Array(SearchedPlaylist)),
      playlistCount: Loose(Schema.Finite),
    }),
    trp: Loose(
      UpstreamObject({
        rules: Loose(Schema.Array(Schema.String)),
      }),
    ),
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

const cloudsearch: ModuleEffect<ModuleInput, ModuleBody> = (query, request) =>
  Effect.gen(function* () {
    const data = {
      s: query.keywords,
      type: query.type || 1, // 1: 单曲, 10: 专辑, 100: 歌手, 1000: 歌单, 1002: 用户, 1004: MV, 1006: 歌词, 1009: 电台, 1014: 视频
      limit: query.limit || 30,
      offset: query.offset || 0,
      total: true,
    };
    const response = yield* request(
      buildApiRequestIntent(`/api/cloudsearch/pc`, data, createOption(query)),
    );
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

export { decodeLegacyModuleInput as decodeModuleInput } from '../core/module-input.ts';

export type ModuleInput = LegacyModuleInput;
