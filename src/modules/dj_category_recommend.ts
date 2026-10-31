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

const RadioIcon = UpstreamObject({
  color: Loose(Schema.String),
  type: Loose(Schema.String),
  value: Loose(Schema.String),
});

const Radio = UpstreamObject({
  id: Schema.Finite,
  alg: Loose(Schema.String),
  feeScope: Loose(Schema.Finite),
  icon: Loose(RadioIcon),
  lastProgramName: Loose(Schema.String),
  name: Loose(Schema.String),
  picUrl: Loose(Schema.String),
  playCount: Loose(Schema.Finite),
  programCount: Loose(Schema.Finite),
  radioFeeType: Loose(Schema.Finite),
  rcmdText: Loose(Schema.String),
  subCount: Loose(Schema.Finite),
  subed: Loose(Schema.Boolean),
});

const Category = UpstreamObject({
  categoryId: Schema.Finite,
  categoryName: Loose(Schema.String),
  radios: Schema.Array(Radio),
});

// 通到推荐分类的路径 `data`、分类编号 `data[].categoryId` 和分类下的电台列表 `data[].radios` 收紧，电台自己的编号 `radios[].id` 也收紧；`msg` 只见过 null，未声明。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    data: Schema.Array(Category),
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

const djCategoryRecommend: ModuleEffect<ModuleInput, ModuleBody> = (
  query,
  request,
) =>
  Effect.gen(function* () {
    const response = yield* request(
      buildApiRequestIntent(
        `/api/djradio/home/category/recommend`,
        {},
        createOption(query, 'weapi'),
      ),
    );
    const body = yield* decodeUpstreamBody(
      'dj_category_recommend',
      ModuleBody,
      response,
    );
    return { ...toModuleResponse(response), body };
  });

/**
 * 电台推荐类型
 */
export default djCategoryRecommend;

export { decodeLegacyModuleInput as decodeModuleInput } from '../core/module-input.ts';

export type ModuleInput = LegacyModuleInput;
