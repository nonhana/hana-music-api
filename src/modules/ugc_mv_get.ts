import { Effect, Schema } from 'effect';

import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import {
  decodeUpstreamBody,
  Loose,
  UpstreamObject,
} from '../core/upstream-body.ts';
import { UgcArtistRef } from '../core/upstream-schemas.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';

const AlbumRef = UpstreamObject({
  albumId: Loose(Schema.Finite),
  albumName: Loose(Schema.String),
});

const MvSongRep = UpstreamObject({
  songId: Loose(Schema.Finite),
  songName: Loose(Schema.String),
  albumRepVo: Loose(AlbumRef),
  artistRepVos: Loose(Schema.Array(UgcArtistRef)),
});

// 返回码、MV 百科记录的路径 `data` 和 MV 自己的编号 `data.mvId` 收紧；未知 MV 是 code 404 的业务拒绝，正文里没有 `data`；歌手、关联歌曲和封面字段全部宽松。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    data: UpstreamObject({
      mvId: Schema.Finite,
      mvName: Loose(Schema.String),
      artistRepVos: Loose(Schema.Array(UgcArtistRef)),
      desc: Loose(Schema.String),
      mvSongVos: Loose(Schema.Array(MvSongRep)),
      pic16v9Url: Loose(Schema.String),
      pic4v3Url: Loose(Schema.String),
      publishTime: Loose(Schema.Finite),
    }),
    message: Loose(Schema.String),
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

const ugcMvGet: ModuleEffect<ModuleInput, ModuleBody> = (query, request) =>
  Effect.gen(function* () {
    const data = {
      mvId: query.id,
    };
    const response = yield* request(
      buildApiRequestIntent(`/api/rep/ugc/mv/get`, data, createOption(query)),
    );
    const body = yield* decodeUpstreamBody('ugc_mv_get', ModuleBody, response);
    return { ...toModuleResponse(response), body };
  });

/**
 * mv简要百科信息
 */
export default ugcMvGet;

export { decodeLegacyModuleInput as decodeModuleInput } from '../core/module-input.ts';

export type ModuleInput = LegacyModuleInput;
