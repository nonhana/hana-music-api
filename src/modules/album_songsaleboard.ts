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
import type { QueryNumberLike } from '../types/module-shared.ts';

export type AlbumSalesBoardType =
  | 'daily'
  | 'week'
  | 'year'
  | 'total'
  | (string & {});

export type ModuleInput = {
  albumType?: QueryNumberLike;
  type?: AlbumSalesBoardType;
  year?: QueryNumberLike;
};

const inputSchema = Schema.Struct({
  albumType: Schema.optional(QueryNumber),
  type: Schema.optional(
    Schema.Union([
      Schema.Literal('daily'),
      Schema.Literal('week'),
      Schema.Literal('year'),
      Schema.Literal('total'),
      Schema.String,
    ]),
  ),
  year: Schema.optional(QueryNumber),
});

export const decodeModuleInput = (input: unknown) =>
  decodeInput(inputSchema, input);

const SalesProduct = UpstreamObject({
  albumId: Schema.Finite,
  albumName: Loose(Schema.String),
  albumType: Loose(Schema.Finite),
  artistName: Loose(Schema.String),
  bundling: Loose(Schema.Finite),
  coverUrl: Loose(Schema.String),
  newAlbum: Loose(Schema.Boolean),
  newest: Loose(Schema.Boolean),
  period: Loose(Schema.Finite),
  price: Loose(Schema.Finite),
  rank: Loose(Schema.Finite),
  rankIncr: Loose(Schema.Finite),
  saleNum: Loose(Schema.Finite),
  salesCertificationSystemLevelCode: Loose(Schema.String),
  saleType: Loose(Schema.Finite),
  status: Loose(Schema.Finite),
});

// 通到销售榜的路径 `products` 和每条记录的专辑编号 `products[].albumId` 收紧；`hasMore` 只有年榜/总榜才有，宽松。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    products: Schema.Array(SalesProduct),
    hasMore: Loose(Schema.Boolean),
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

const albumSongsaleboard: ModuleEffect<ModuleInput, ModuleBody> = (
  query,
  request,
) =>
  Effect.gen(function* () {
    let data: Record<string, unknown> = {
      albumType: query.albumType || 0, //0为数字专辑,1为数字单曲
    };
    const type = query.type || 'daily'; // daily,week,year,total
    if (type === 'year') {
      data = {
        ...data,
        year: query.year,
      };
    }
    const response = yield* request(
      buildApiRequestIntent(
        `/api/feealbum/songsaleboard/${type}/type`,
        data,
        createOption(query, 'weapi'),
      ),
    );
    const body = yield* decodeUpstreamBody(
      'album_songsaleboard',
      ModuleBody,
      response,
    );
    return { ...toModuleResponse(response), body };
  });

/**
 * 数字专辑&数字单曲-榜单
 */
export default albumSongsaleboard;
