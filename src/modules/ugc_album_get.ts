import * as Effect from 'effect/Effect';
import * as Schema from 'effect/Schema';

import {
  decodeModuleInput as decodeInput,
  NumberId,
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
import { UgcArtistRef } from '../core/upstream-schemas.ts';
import type { ModuleEffect } from '../types/index.ts';

export type ModuleInput = { id: NumberId };

const inputSchema = Schema.Struct({
  id: NumberId,
});

export const decodeModuleInput = (input: unknown) =>
  decodeInput(inputSchema, input);

const SongTag = UpstreamObject({
  id: Loose(Schema.Finite),
  name: Loose(Schema.String),
});

const AlbumSongRep = UpstreamObject({
  songId: Loose(Schema.Finite),
  songName: Loose(Schema.String),
  artistRepVos: UgcArtistRef.pipe(Schema.Array, Loose),
  songSubTitle: Loose(Schema.String),
  publishTime: Loose(Schema.Finite),
  language: Loose(Schema.String),
  no: Loose(Schema.Finite),
  disc: Loose(Schema.String),
  songTags: SongTag.pipe(Schema.Array, Loose),
  transName: Loose(Schema.String),
});

// 返回码、专辑百科记录的路径 `data` 和专辑自己的编号 `data.albumId` 收紧；未知专辑的 `data` 整个缺失，写成可以没有；专辑里的歌手、歌曲和标签是随行信息，字段全部宽松。
export const ModuleBody = /* @__PURE__ */ defineModuleBody(
  UpstreamObject({
    code: Schema.Literal(200),
    data: Optional(
      UpstreamObject({
        albumId: Schema.Finite,
        albumName: Loose(Schema.String),
        albumPicUrl: Loose(Schema.String),
        albumSubTitle: Loose(Schema.String),
        artistRepVos: UgcArtistRef.pipe(Schema.Array, Loose),
        company: Loose(Schema.String),
        language: Loose(Schema.String),
        production: Loose(Schema.String),
        publishTime: Loose(Schema.Finite),
        songRepVos: AlbumSongRep.pipe(Schema.Array, Loose),
        songTags: SongTag.pipe(Schema.Array, Loose),
        type: Loose(Schema.String),
      }),
    ),
    message: Loose(Schema.String),
  }),
);
export type ModuleBody = BodyType<typeof ModuleBody>;

export const moduleActions = {
  read: {
    target: '/api/rep/ugc/album/get',
    profile: 'eapi',
    semantic: 'read',
    cache: 'none',
    retry: 'connect',
  },
} as const satisfies ModuleActions;

const ugcAlbumGet: ModuleEffect<
  ModuleInput,
  ModuleBody,
  typeof moduleActions
> = (query, request) =>
  Effect.gen(function* () {
    const data = {
      albumId: query.id,
    };
    const response = yield* request('read', { data });
    const body = yield* decodeUpstreamBody(
      'ugc_album_get',
      ModuleBody,
      response,
    );
    return { ...toModuleResponse(response), body };
  });

/**
 * 专辑简要百科信息
 */
export default ugcAlbumGet;
