import { Effect, Schema } from 'effect';

import {
  decodeModuleInput as decodeInput,
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
import type { ModuleEffect } from '../types/index.ts';
import type { PagedQuery } from '../types/module-shared.ts';

export type AlbumStyleArea = 'Z_H' | 'E_A' | 'KR' | 'JP' | (string & {});

export type ModuleInput = PagedQuery & {
  area?: AlbumStyleArea;
};

const inputSchema = Schema.Struct({
  limit: Schema.optional(QueryNumber),
  offset: Schema.optional(QueryNumber),
  area: Schema.optional(
    Schema.Union([
      Schema.Literal('Z_H'),
      Schema.Literal('E_A'),
      Schema.Literal('KR'),
      Schema.Literal('JP'),
      Schema.String,
    ]),
  ),
});

export const decodeModuleInput = (input: unknown) =>
  decodeInput(inputSchema, input);

const StyleAlbum = UpstreamObject({
  albumId: Schema.Finite,
  albumName: Loose(Schema.String),
  artistName: Loose(Schema.String),
  artistNames: Loose(Schema.Array(Schema.String)),
  bought: Loose(Schema.Boolean),
  coverUrl: Loose(Schema.String),
  price: Loose(Schema.Finite),
  saleDisplayType: Loose(Schema.Finite),
  sales: Loose(Schema.Finite),
  type: Loose(Schema.Finite),
});

// 通到风格馆列表的路径 `albumProducts` 和每张专辑的编号 `albumProducts[].albumId` 收紧；其余字段宽松。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    albumProducts: Schema.Array(StyleAlbum),
    hasNextPage: Loose(Schema.Boolean),
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

const albumListStyle: ModuleEffect<ModuleInput, ModuleBody> = (
  query,
  request,
) =>
  Effect.gen(function* () {
    const data = {
      limit: query.limit || 10,
      offset: query.offset || 0,
      total: true,
      area: query.area || 'Z_H', //Z_H:华语,E_A:欧美,KR:韩国,JP:日本
    };
    const response = yield* request(
      buildApiRequestIntent(
        `/api/vipmall/appalbum/album/style`,
        data,
        createOption(query, 'weapi'),
      ),
    );
    const body = yield* decodeUpstreamBody(
      'album_list_style',
      ModuleBody,
      response,
    );
    return { ...toModuleResponse(response), body };
  });

/**
 * 数字专辑-语种风格馆
 */
export default albumListStyle;
