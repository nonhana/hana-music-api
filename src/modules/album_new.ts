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
import { AlbumSummary } from '../core/upstream-schemas.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { PagedQuery, QueryNumberLike } from '../types/module-shared.ts';
import type { AlbumArea } from './album_list.ts';

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

// 通到新碟列表的路径 `albums` 和每张专辑的编号收紧（共用 `AlbumSummary`）；`total` 宽松。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    albums: Schema.Array(AlbumSummary),
    total: Loose(Schema.Finite),
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

const albumNew: ModuleEffect<ModuleInput, ModuleBody> = (query, request) =>
  Effect.gen(function* () {
    const data = {
      limit: query.limit || 30,
      offset: query.offset || 0,
      total: true,
      area: query.area || 'ALL', //ALL:全部,ZH:华语,EA:欧美,KR:韩国,JP:日本
    };
    const response = yield* request(
      buildApiRequestIntent(
        `/api/album/new`,
        data,
        createOption(query, 'weapi'),
      ),
    );
    const body = yield* decodeUpstreamBody('album_new', ModuleBody, response);
    return { ...toModuleResponse(response), body };
  });

/**
 * 全部新碟
 */
export default albumNew;
