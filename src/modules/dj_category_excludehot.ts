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
  pic56x56Id: Loose(Schema.Finite),
  pic56x56IdStr: Loose(Schema.String),
  pic56x56Url: Loose(Schema.String),
  pic84x84Id: Loose(Schema.Finite),
  pic84x84IdUrl: Loose(Schema.String),
  pic96x96Id: Loose(Schema.Finite),
  pic96x96IdStr: Loose(Schema.String),
  pic96x96Url: Loose(Schema.String),
  picIPad: Loose(Schema.Finite),
  picIPadStr: Loose(Schema.String),
  picIPadUrl: Loose(Schema.String),
  picMacId: Loose(Schema.String),
  picMacUrl: Loose(Schema.String),
  picPCBlack: Loose(Schema.Finite),
  picPCBlackStr: Loose(Schema.String),
  picPCBlackUrl: Loose(Schema.String),
  picPCWhite: Loose(Schema.Finite),
  picPCWhiteStr: Loose(Schema.String),
  picPCWhiteUrl: Loose(Schema.String),
  picUWPId: Loose(Schema.String),
  picUWPUrl: Loose(Schema.String),
  picWeb: Loose(Schema.Finite),
  picWebStr: Loose(Schema.String),
  picWebUrl: Loose(Schema.String),
});

// 通到非热门电台分类列表的路径 `data` 和分类自己的编号 `data[].id` 收紧；其余展示字段宽松。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    data: Schema.Array(Category),
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

const djCategoryExcludehot: ModuleEffect<ModuleInput, ModuleBody> = (
  query,
  request,
) =>
  Effect.gen(function* () {
    const response = yield* request(
      buildApiRequestIntent(
        `/api/djradio/category/excludehot`,
        {},
        createOption(query, 'weapi'),
      ),
    );
    const body = yield* decodeUpstreamBody(
      'dj_category_excludehot',
      ModuleBody,
      response,
    );
    return { ...toModuleResponse(response), body };
  });

/**
 * 电台非热门类型
 */
export default djCategoryExcludehot;

export { decodeLegacyModuleInput as decodeModuleInput } from '../core/module-input.ts';

export type ModuleInput = LegacyModuleInput;
