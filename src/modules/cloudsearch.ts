import { Effect, Schema } from 'effect';

import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import { decodeUpstreamBody, UpstreamObject } from '../core/upstream-body.ts';
import { Artist, Song, SongPrivilege } from '../core/upstream-schemas.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';

const SearchedAlbum = UpstreamObject({
  id: Schema.Finite,
  name: Schema.String,
  picUrl: Schema.String,
  artists: Schema.Array(Artist),
  publishTime: Schema.Finite,
});

// 没有头像的歌手 picUrl 是 null。
const SearchedArtist = UpstreamObject({
  id: Schema.Finite,
  name: Schema.String,
  picUrl: Schema.NullOr(Schema.String),
  musicSize: Schema.Finite,
});

const SearchedPlaylist = UpstreamObject({
  id: Schema.Finite,
  name: Schema.String,
  coverImgUrl: Schema.String,
  trackCount: Schema.Finite,
  playCount: Schema.Finite,
  creator: UpstreamObject({
    userId: Schema.Finite,
    nickname: Schema.String,
  }),
});

// 按 type 只给一类结果：单曲在 songs、专辑在 albums、歌手在 artists、歌单在 playlists，各带结果总数；没有结果时只有总数（0），列表整个缺失。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    result: UpstreamObject({
      songs: Schema.optionalKey(
        Schema.Array(
          UpstreamObject({
            ...Song.schema.fields,
            al: UpstreamObject({
              ...Song.schema.fields.al.schema.fields,
              // 搜索结果中的专辑名可能整个缺失，其他歌曲接口仍使用共用约束（#79）。
              name: Schema.optionalKey(Schema.NullOr(Schema.String)),
            }),
            privilege: SongPrivilege,
          }),
        ),
      ),
      songCount: Schema.optionalKey(Schema.Finite),
      albums: Schema.optionalKey(Schema.Array(SearchedAlbum)),
      albumCount: Schema.optionalKey(Schema.Finite),
      artists: Schema.optionalKey(Schema.Array(SearchedArtist)),
      artistCount: Schema.optionalKey(Schema.Finite),
      playlists: Schema.optionalKey(Schema.Array(SearchedPlaylist)),
      playlistCount: Schema.optionalKey(Schema.Finite),
    }),
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
