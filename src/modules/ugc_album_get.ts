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
import { UgcArtistRef } from '../core/upstream-schemas.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';

const SongTag = UpstreamObject({
  id: Loose(Schema.Finite),
  name: Loose(Schema.String),
});

const AlbumSongRep = UpstreamObject({
  songId: Loose(Schema.Finite),
  songName: Loose(Schema.String),
  artistRepVos: Loose(Schema.Array(UgcArtistRef)),
  songSubTitle: Loose(Schema.String),
  publishTime: Loose(Schema.Finite),
  language: Loose(Schema.String),
  no: Loose(Schema.Finite),
  disc: Loose(Schema.String),
  songTags: Loose(Schema.Array(SongTag)),
  transName: Loose(Schema.String),
});

// 返回码、专辑百科记录的路径 `data` 和专辑自己的编号 `data.albumId` 收紧；未知专辑的 `data` 整个缺失，写成可以没有；专辑里的歌手、歌曲和标签是随行信息，字段全部宽松。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    data: Optional(
      UpstreamObject({
        albumId: Schema.Finite,
        albumName: Loose(Schema.String),
        albumPicUrl: Loose(Schema.String),
        albumSubTitle: Loose(Schema.String),
        artistRepVos: Loose(Schema.Array(UgcArtistRef)),
        company: Loose(Schema.String),
        language: Loose(Schema.String),
        production: Loose(Schema.String),
        publishTime: Loose(Schema.Finite),
        songRepVos: Loose(Schema.Array(AlbumSongRep)),
        songTags: Loose(Schema.Array(SongTag)),
        type: Loose(Schema.String),
      }),
    ),
    message: Loose(Schema.String),
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

const ugcAlbumGet: ModuleEffect<ModuleInput, ModuleBody> = (query, request) =>
  Effect.gen(function* () {
    const data = {
      albumId: query.id,
    };
    const response = yield* request(
      buildApiRequestIntent(
        `/api/rep/ugc/album/get`,
        data,
        createOption(query),
      ),
    );
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

export { decodeLegacyModuleInput as decodeModuleInput } from '../core/module-input.ts';

export type ModuleInput = LegacyModuleInput;
