import { Effect, Schema } from 'effect';

import {
  decodeModuleInput as decodeInput,
  NaturalValue,
} from '../core/module-input.ts';
import type { ModuleActions } from '../core/request-actions.ts';
import { toModuleResponse } from '../core/response.ts';
import {
  decodeUpstreamBody,
  Loose,
  UpstreamObject,
} from '../core/upstream-body.ts';
import type { ModuleEffect } from '../types/index.ts';

export type AlbumArea = 'ALL' | 'ZH' | 'EA' | 'KR' | 'JP';

export type ModuleInput = {
  area?: AlbumArea;
  limit?: number;
  offset?: number;
  type?: number;
};

const inputSchema = Schema.Struct({
  limit: Schema.optional(NaturalValue),
  offset: Schema.optional(NaturalValue),
  area: Schema.optional(Schema.Literals(['ALL', 'ZH', 'EA', 'KR', 'JP'])),
  type: Schema.optional(NaturalValue),
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

export const moduleActions = {
  read: {
    target: '/api/vipmall/albumproduct/list',
    profile: 'web',
    semantic: 'read',
    cache: 'none',
    retry: 'connect',
  },
} as const satisfies ModuleActions;

const albumList: ModuleEffect<ModuleInput, ModuleBody, typeof moduleActions> = (
  query,
  request,
) =>
  Effect.gen(function* () {
    const data = {
      limit: query.limit || 30,
      offset: query.offset || 0,
      total: true,
      area: query.area || 'ALL', //ALL:全部,ZH:华语,EA:欧美,KR:韩国,JP:日本
      type: query.type,
    };
    const response = yield* request('read', { data });
    const body = yield* decodeUpstreamBody('album_list', ModuleBody, response);
    return { ...toModuleResponse(response), body };
  });

/**
 * 数字专辑-新碟上架
 */
export default albumList;
