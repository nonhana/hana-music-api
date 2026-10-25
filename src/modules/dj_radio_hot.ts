import { Effect, Schema } from 'effect';

import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import {
  decodeUpstreamBody,
  Loose,
  UpstreamObject,
} from '../core/upstream-body.ts';
import { PlaylistUser } from '../core/upstream-schemas.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';

const DescText = UpstreamObject({
  text: Loose(Schema.String),
});

const DescNestedData = UpstreamObject({
  textList: Loose(Schema.Array(DescText)),
});

const DescPic = UpstreamObject({
  content: Loose(Schema.String),
  id: Loose(Schema.Finite),
  nestedData: Loose(DescNestedData),
  type: Loose(Schema.Finite),
});

const Radio = UpstreamObject({
  id: Schema.Finite,
  buyed: Loose(Schema.Boolean),
  category: Loose(Schema.String),
  categoryId: Loose(Schema.Finite),
  createTime: Loose(Schema.Finite),
  desc: Loose(Schema.String),
  descPicList: Loose(Schema.Array(DescPic)),
  dj: Loose(PlaylistUser),
  dynamic: Loose(Schema.Boolean),
  feeScope: Loose(Schema.Finite),
  finished: Loose(Schema.Boolean),
  intervenePicId: Loose(Schema.Finite),
  intervenePicUrl: Loose(Schema.String),
  lastProgramCreateTime: Loose(Schema.Finite),
  lastProgramId: Loose(Schema.Finite),
  lastProgramName: Loose(Schema.String),
  name: Loose(Schema.String),
  operateUidList: Loose(Schema.Array(Schema.Finite)),
  originalPrice: Loose(Schema.Finite),
  participateUidList: Loose(Schema.Array(Schema.Finite)),
  picId: Loose(Schema.Finite),
  picUrl: Loose(Schema.String),
  playCount: Loose(Schema.Finite),
  price: Loose(Schema.Finite),
  privacy: Loose(Schema.Boolean),
  programCount: Loose(Schema.Finite),
  purchaseCount: Loose(Schema.Finite),
  radioFeeType: Loose(Schema.Finite),
  rcmdtext: Loose(Schema.String),
  replaceRadioId: Loose(Schema.Finite),
  secondCategory: Loose(Schema.String),
  subCount: Loose(Schema.Finite),
  subed: Loose(Schema.Boolean),
  taskId: Loose(Schema.Finite),
  underShelf: Loose(Schema.Boolean),
});

// 通到分类热门电台列表的路径 `djRadios` 和每个电台的编号 `djRadios[].id` 收紧；主播、简介图文和其余字段宽松。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    count: Loose(Schema.Finite),
    djRadios: Schema.Array(Radio),
    hasMore: Loose(Schema.Boolean),
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

const djRadioHot: ModuleEffect<ModuleInput, ModuleBody> = (query, request) =>
  Effect.gen(function* () {
    const data = {
      cateId: query.cateId,
      limit: query.limit || 30,
      offset: query.offset || 0,
    };
    const response = yield* request(
      buildApiRequestIntent(
        `/api/djradio/hot`,
        data,
        createOption(query, 'weapi'),
      ),
    );
    const body = yield* decodeUpstreamBody(
      'dj_radio_hot',
      ModuleBody,
      response,
    );
    return { ...toModuleResponse(response), body };
  });

/**
 * 类别热门电台
 */
export default djRadioHot;

export { decodeLegacyModuleInput as decodeModuleInput } from '../core/module-input.ts';

export type ModuleInput = LegacyModuleInput;
