import { Effect, Schema } from 'effect';

import {
  decodeModuleInput as decodeInput,
  NaturalValue,
  NumberLiterals,
} from '../core/module-input.ts';
import type { ModuleActions } from '../core/request-actions.ts';
import type { ModuleEffect } from '../types/index.ts';
// 歌手分类
/*
    type 取值
    1:男歌手
    2:女歌手
    3:乐队

    area 取值
    -1:全部
    7华语
    96欧美
    8:日本
    16韩国
    0:其他

    initial 取值 a-z/A-Z
*/

import { toModuleResponse } from '../core/response.ts';
import {
  decodeUpstreamBody,
  Loose,
  UpstreamObject,
} from '../core/upstream-body.ts';
import { Artist } from '../core/upstream-schemas.ts';

// area、type 的取值由模块注释和文档穷举（type=-1 表示全部）；initial 支持字母或数字哨兵。
export type ModuleInput = {
  area?: -1 | 0 | 7 | 8 | 16 | 96;
  initial?: string | -1;
  limit?: NaturalValue;
  offset?: NaturalValue;
  type?: -1 | 1 | 2 | 3;
};

const inputSchema = Schema.Struct({
  area: Schema.optional(NumberLiterals([-1, 0, 7, 8, 16, 96])),
  initial: Schema.optional(Schema.Union([Schema.String, Schema.Literal(-1)])),
  limit: Schema.optional(NaturalValue),
  offset: Schema.optional(NaturalValue),
  type: Schema.optional(NumberLiterals([-1, 1, 2, 3])),
});

export const decodeModuleInput = (input: unknown) =>
  decodeInput(inputSchema, input);

const ArtistListItem = UpstreamObject({
  ...Artist.schema.fields,
  fansCount: Loose(Schema.Finite),
  id: Schema.Finite,
});

// 通到歌手列表的路径 `artists` 和歌手自己的编号收紧；`more` 是分页标记，宽松。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    artists: Schema.Array(ArtistListItem),
    more: Loose(Schema.Boolean),
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

export const moduleActions = {
  read: {
    target: '/api/v1/artist/list',
    profile: 'web',
    semantic: 'read',
    cache: 'none',
    retry: 'connect',
  },
} as const satisfies ModuleActions;

const artistList: ModuleEffect<
  ModuleInput,
  ModuleBody,
  typeof moduleActions
> = (query, request) =>
  Effect.gen(function* () {
    const data = {
      initial:
        query.initial === -1
          ? -1
          : query.initial
            ? Number.isNaN(Number(query.initial))
              ? query.initial.toUpperCase().charCodeAt(0)
              : query.initial
            : undefined,
      offset: query.offset || 0,
      limit: query.limit || 30,
      total: true,
      type: query.type || 1,
      area: query.area,
    };
    const response = yield* request('read', { data });
    const body = yield* decodeUpstreamBody('artist_list', ModuleBody, response);
    return { ...toModuleResponse(response), body };
  });

export default artistList;
