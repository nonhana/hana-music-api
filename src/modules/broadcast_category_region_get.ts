import { Effect, Schema } from 'effect';

import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import {
  decodeUpstreamBody,
  Loose,
  UpstreamObject,
} from '../core/upstream-body.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';

const Category = UpstreamObject({
  id: Schema.Finite,
  name: Loose(Schema.String),
});

const Region = UpstreamObject({
  id: Schema.Finite,
  name: Loose(Schema.String),
});

// 通到分类和地区列表的路径 `data.categoryList`、`data.regionList` 以及每条分类/地区自己的编号收紧。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    data: UpstreamObject({
      categoryList: Schema.Array(Category),
      regionList: Schema.Array(Region),
    }),
    message: Loose(Schema.String),
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

const broadcastCategoryRegionGet: ModuleEffect<ModuleInput, ModuleBody> = (
  query,
  request,
) =>
  Effect.gen(function* () {
    const data = {};
    const response = yield* request(
      buildApiRequestIntent(
        `/api/voice/broadcast/category/region/get`,
        data,
        createOption(query),
      ),
    );
    const body = yield* decodeUpstreamBody(
      'broadcast_category_region_get',
      ModuleBody,
      response,
    );
    return { ...toModuleResponse(response), body };
  });

/**
 * 广播电台 - 分类/地区信息
 */
export default broadcastCategoryRegionGet;

export { decodeLegacyModuleInput as decodeModuleInput } from '../core/module-input.ts';

export type ModuleInput = LegacyModuleInput;
