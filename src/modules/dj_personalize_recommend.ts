import { Effect, Schema } from 'effect';

import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import {
  decodeUpstreamBody,
  Loose,
  UpstreamObject,
} from '../core/upstream-body.ts';
import { ProgramDj } from '../core/upstream-schemas.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';

// 电台个性推荐的条目是电台记录：编号自己的 `id` 收紧，主播复用节目的 `ProgramDj`。
const Radio = UpstreamObject({
  id: Schema.Finite,
  alg: Loose(Schema.String),
  buyed: Loose(Schema.Boolean),
  category: Loose(Schema.String),
  categoryId: Loose(Schema.Finite),
  composeVideo: Loose(Schema.Boolean),
  createTime: Loose(Schema.Finite),
  danmakuCount: Loose(Schema.Finite),
  deleted: Loose(Schema.Boolean),
  desc: Loose(Schema.String),
  dj: Loose(ProgramDj),
  dynamic: Loose(Schema.Boolean),
  feeScope: Loose(Schema.Finite),
  finished: Loose(Schema.Boolean),
  hightQuality: Loose(Schema.Boolean),
  intervenePicId: Loose(Schema.Finite),
  intervenePicUrl: Loose(Schema.String),
  lastProgramCreateTime: Loose(Schema.Finite),
  lastProgramId: Loose(Schema.Finite),
  lastProgramName: Loose(Schema.String),
  lastUpdateProgramName: Loose(Schema.String),
  name: Loose(Schema.String),
  onlySelfSee: Loose(Schema.Boolean),
  original: Loose(Schema.String),
  originalPrice: Loose(Schema.Finite),
  picId: Loose(Schema.Finite),
  picUrl: Loose(Schema.String),
  playCount: Loose(Schema.Finite),
  price: Loose(Schema.Finite),
  privacy: Loose(Schema.Boolean),
  programCount: Loose(Schema.Finite),
  programOrder: Loose(Schema.Finite),
  purchaseCount: Loose(Schema.Finite),
  radioFeeType: Loose(Schema.Finite),
  rcmdText: Loose(Schema.String),
  rcmdtext: Loose(Schema.String),
  secondCategory: Loose(Schema.String),
  secondCategoryId: Loose(Schema.Finite),
  specialType: Loose(Schema.Finite),
  subCount: Loose(Schema.Finite),
  subed: Loose(Schema.Boolean),
  taskId: Loose(Schema.Finite),
  underShelf: Loose(Schema.Boolean),
  userDeleted: Loose(Schema.Boolean),
  whiteList: Loose(Schema.Boolean),
});

// 通到个性推荐电台的路径 `data` 和每个电台自己的编号 `data[].id` 收紧；其余字段宽松。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    data: Schema.Array(Radio),
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

const djPersonalizeRecommend: ModuleEffect<ModuleInput, ModuleBody> = (
  query,
  request,
) =>
  Effect.gen(function* () {
    const response = yield* request(
      buildApiRequestIntent(
        `/api/djradio/personalize/rcmd`,
        {
          limit: query.limit || 6,
        },
        createOption(query, 'weapi'),
      ),
    );
    const body = yield* decodeUpstreamBody(
      'dj_personalize_recommend',
      ModuleBody,
      response,
    );
    return { ...toModuleResponse(response), body };
  });

/**
 * 电台个性推荐
 */
export default djPersonalizeRecommend;

export { decodeLegacyModuleInput as decodeModuleInput } from '../core/module-input.ts';

export type ModuleInput = LegacyModuleInput;
