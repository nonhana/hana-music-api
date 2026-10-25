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
import { AlbumSummary } from '../core/upstream-schemas.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';

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

const topAlbum: ModuleEffect<ModuleInput, ModuleBody> = (query, request) =>
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
    const response = yield* request(
      buildApiRequestIntent(
        `/api/discovery/new/albums/area`,
        data,
        createOption(query, 'weapi'),
      ),
    );
    const body = yield* decodeUpstreamBody('top_album', ModuleBody, response);
    return { ...toModuleResponse(response), body };
  });

/**
 * 新碟上架
 */
export default topAlbum;

export { decodeLegacyModuleInput as decodeModuleInput } from '../core/module-input.ts';

export type ModuleInput = LegacyModuleInput;
