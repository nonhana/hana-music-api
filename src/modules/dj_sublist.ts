import { Effect, Schema } from 'effect';

import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import {
  decodeUpstreamBody,
  Loose,
  UpstreamObject,
} from '../core/upstream-body.ts';
import { PlaylistUser, ProgramDescPic } from '../core/upstream-schemas.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';

const Radio = UpstreamObject({
  id: Schema.Finite,
  buyed: Loose(Schema.Boolean),
  category: Loose(Schema.String),
  categoryId: Loose(Schema.Finite),
  createTime: Loose(Schema.Finite),
  desc: Loose(Schema.String),
  descPicList: Loose(Schema.Array(ProgramDescPic)),
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
  newProgramCount: Loose(Schema.Finite),
  operateUidList: Loose(Schema.Array(Schema.Finite)),
  originalPrice: Loose(Schema.Finite),
  picId: Loose(Schema.Finite),
  picUrl: Loose(Schema.String),
  playCount: Loose(Schema.Finite),
  price: Loose(Schema.Finite),
  privacy: Loose(Schema.Boolean),
  programCount: Loose(Schema.Finite),
  purchaseCount: Loose(Schema.Finite),
  radioFeeType: Loose(Schema.Finite),
  replaceRadioId: Loose(Schema.Finite),
  secondCategory: Loose(Schema.String),
  subCount: Loose(Schema.Finite),
  taskId: Loose(Schema.Finite),
  underShelf: Loose(Schema.Boolean),
});

// 通到订阅列表的路径 `djRadios` 和每个电台自己的编号 `djRadios[].id` 收紧；`count`、`time`、`hasMore`、
// 电台展示字段和主播记录（复用宽松的 `PlaylistUser`）宽松。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    djRadios: Schema.Array(Radio),
    count: Loose(Schema.Finite),
    time: Loose(Schema.Finite),
    hasMore: Loose(Schema.Boolean),
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

const djSublist: ModuleEffect<ModuleInput, ModuleBody> = (query, request) =>
  Effect.gen(function* () {
    const data = {
      limit: query.limit || 30,
      offset: query.offset || 0,
      total: true,
    };
    const response = yield* request(
      buildApiRequestIntent(
        `/api/djradio/get/subed`,
        data,
        createOption(query, 'weapi'),
      ),
    );
    const body = yield* decodeUpstreamBody('dj_sublist', ModuleBody, response);
    return { ...toModuleResponse(response), body };
  });

/**
 * 订阅电台列表
 */
export default djSublist;

export { decodeLegacyModuleInput as decodeModuleInput } from '../core/module-input.ts';

export type ModuleInput = LegacyModuleInput;
