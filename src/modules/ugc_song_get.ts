import { Effect, Schema } from 'effect';

import type { ModuleActions } from '../core/request-actions.ts';
import { toModuleResponse } from '../core/response.ts';
import {
  decodeUpstreamBody,
  Loose,
  Optional,
  UpstreamObject,
} from '../core/upstream-body.ts';
import { UgcArtistRef } from '../core/upstream-schemas.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';

const AlbumRef = UpstreamObject({
  albumId: Loose(Schema.Finite),
  albumName: Loose(Schema.String),
});

// 返回码、歌曲百科记录的路径 `data` 和歌曲自己的编号 `data.songId` 收紧；未知歌曲的 `data` 整个缺失，写成可以没有；歌手、专辑、歌词和状态字段全部宽松。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    data: Optional(
      UpstreamObject({
        songId: Schema.Finite,
        songName: Loose(Schema.String),
        artistRepVos: Loose(Schema.Array(UgcArtistRef)),
        songSubTitle: Loose(Schema.String),
        publishTime: Loose(Schema.Finite),
        language: Loose(Schema.String),
        originalCover: Loose(Schema.Finite),
        disc: Loose(Schema.String),
        lyricArtists: Loose(Schema.Array(UgcArtistRef)),
        composeArtists: Loose(Schema.Array(UgcArtistRef)),
        albumRepVo: Loose(AlbumRef),
        transName: Loose(Schema.String),
        lyricContent: Loose(Schema.String),
        transLyricContent: Loose(Schema.String),
        playUrl: Loose(Schema.String),
        forTransLyric: Loose(Schema.Finite),
        noNeedLyric: Loose(Schema.Finite),
        lyricLock: Loose(Schema.Finite),
        transLyricLock: Loose(Schema.Finite),
        lyricIsEdited: Loose(Schema.Finite),
        duration: Loose(Schema.Finite),
      }),
    ),
    message: Loose(Schema.String),
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

export const moduleActions = {
  read: {
    target: '/api/rep/ugc/song/get',
    profile: 'eapi',
    semantic: 'read',
    cache: 'none',
    retry: 'connect',
  },
} as const satisfies ModuleActions;

const ugcSongGet: ModuleEffect<
  ModuleInput,
  ModuleBody,
  typeof moduleActions
> = (query, request) =>
  Effect.gen(function* () {
    const data = {
      songId: query.id,
    };
    const response = yield* request('read', { data });
    const body = yield* decodeUpstreamBody(
      'ugc_song_get',
      ModuleBody,
      response,
    );
    return { ...toModuleResponse(response), body };
  });

/**
 * 歌曲简要百科信息
 */
export default ugcSongGet;

export { decodeLegacyModuleInput as decodeModuleInput } from '../core/module-input.ts';

export type ModuleInput = LegacyModuleInput;
