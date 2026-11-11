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
  Optional,
  UpstreamObject,
} from '../core/upstream-body.ts';
import { AlbumSummary } from '../core/upstream-schemas.ts';
import type { ModuleEffect } from '../types/index.ts';

export type ModuleInput = {
  area?: string;
  type?: 'new' | 'hot';
  limit?: NaturalValue;
  offset?: NaturalValue;
  year?: NaturalValue;
  month?: NaturalValue;
};

const inputSchema = Schema.Struct({
  area: Schema.optional(Schema.String),
  type: Schema.optional(Schema.Literals(['new', 'hot'])),
  limit: Schema.optional(NaturalValue),
  offset: Schema.optional(NaturalValue),
  year: Schema.optional(NaturalValue),
  month: Schema.optional(NaturalValue),
});

export const decodeModuleInput = (input: unknown) =>
  decodeInput(inputSchema, input);

// 新碟记录共用 `AlbumSummary`，另声明两张列表都有的宽松字段 `areaId`、`exclusive`。
const Album = UpstreamObject({
  ...AlbumSummary.schema.fields,
  areaId: Loose(Schema.Finite),
  exclusive: Loose(Schema.Boolean),
});

// 通到新碟列表的路径 `weekData`/`monthData` 和每张专辑的编号收紧；没有本周新碟时 `weekData` 整个没有。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    hasMore: Loose(Schema.Boolean),
    weekData: Optional(Schema.Array(Album)),
    monthData: Schema.Array(Album),
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

export const moduleActions = {
  read: {
    target: '/api/discovery/new/albums/area',
    profile: 'web',
    semantic: 'read',
    cache: 'none',
    retry: 'connect',
  },
} as const satisfies ModuleActions;

const topAlbum: ModuleEffect<ModuleInput, ModuleBody, typeof moduleActions> = (
  query,
  request,
) =>
  Effect.gen(function* () {
    const date = new Date();

    const data = {
      area: query.area || 'ALL', // //ALL:全部,ZH:华语,EA:欧美,KR:韩国,JP:日本
      limit: query.limit || 50,
      offset: query.offset || 0,
      type: query.type || 'new',
      year: query.year || date.getFullYear(),
      month: query.month || date.getMonth() + 1,
      total: false,
      rcmd: true,
    };
    const response = yield* request('read', { data });
    const body = yield* decodeUpstreamBody('top_album', ModuleBody, response);
    return { ...toModuleResponse(response), body };
  });

/**
 * 新碟上架
 */
export default topAlbum;
