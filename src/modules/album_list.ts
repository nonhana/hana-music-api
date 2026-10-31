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
import type { PagedQuery, QueryNumberLike } from '../types/module-shared.ts';

export type AlbumArea = 'ALL' | 'ZH' | 'EA' | 'KR' | 'JP' | (string & {});

export type ModuleInput = PagedQuery & {
  area?: AlbumArea;
  type?: QueryNumberLike;
};

const inputSchema = Schema.Struct({
  limit: Schema.optional(QueryNumber),
  offset: Schema.optional(QueryNumber),
  area: Schema.optional(
    Schema.Union([
      Schema.Literal('ALL'),
      Schema.Literal('ZH'),
      Schema.Literal('EA'),
      Schema.Literal('KR'),
      Schema.Literal('JP'),
      Schema.String,
    ]),
  ),
  type: Schema.optional(QueryNumber),
});

export const decodeModuleInput = (input: unknown) =>
  decodeInput(inputSchema, input);

const AlbumProduct = UpstreamObject({
  albumId: Schema.Finite,
  albumName: Loose(Schema.String),
  albumType: Loose(Schema.Finite),
  area: Loose(Schema.Finite),
  artistName: Loose(Schema.String),
  artistType: Loose(Schema.Finite),
  coverUrl: Loose(Schema.String),
  newAlbum: Loose(Schema.Boolean),
  price: Loose(Schema.Finite),
  productId: Loose(Schema.Finite),
  pubTime: Loose(Schema.Finite),
  saleNum: Loose(Schema.Finite),
  saleType: Loose(Schema.Finite),
  status: Loose(Schema.Finite),
});

// 通到数字专辑列表的路径 `products` 和每张专辑的编号 `products[].albumId` 收紧；其余字段宽松。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    products: Schema.Array(AlbumProduct),
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

const albumList: ModuleEffect<ModuleInput, ModuleBody> = (query, request) =>
  Effect.gen(function* () {
    const data = {
      limit: query.limit || 30,
      offset: query.offset || 0,
      total: true,
      area: query.area || 'ALL', //ALL:全部,ZH:华语,EA:欧美,KR:韩国,JP:日本
      type: query.type,
    };
    const response = yield* request(
      buildApiRequestIntent(
        `/api/vipmall/albumproduct/list`,
        data,
        createOption(query, 'weapi'),
      ),
    );
    const body = yield* decodeUpstreamBody('album_list', ModuleBody, response);
    return { ...toModuleResponse(response), body };
  });

/**
 * 数字专辑-新碟上架
 */
export default albumList;
