import { Effect, Schema } from 'effect';

import {
  decodeModuleInput as decodeInput,
  QueryIdentifier as Identifier,
} from '../core/module-input.ts';
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
import type { QueryIdentifier } from '../types/module-shared.ts';

export type ModuleInput = {
  uid: QueryIdentifier;
};

const inputSchema = Schema.Struct({
  uid: Identifier,
});

export const decodeModuleInput = (input: unknown) =>
  decodeInput(inputSchema, input);

// 用户创建的电台记录：每条电台自己的 `id` 收紧，主播复用宽松的 `PlaylistUser`，其余字段宽松。
const UserAudioRadio = UpstreamObject({
  id: Schema.Finite,
  buyed: Loose(Schema.Boolean),
  category: Loose(Schema.String),
  categoryId: Loose(Schema.Finite),
  createTime: Loose(Schema.Finite),
  desc: Loose(Schema.String),
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
  originalPrice: Loose(Schema.Finite),
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
  taskId: Loose(Schema.Finite),
  underShelf: Loose(Schema.Boolean),
});

// 返回码和用户创建的电台列表 `djRadios` 及每条电台自己的编号 `djRadios[].id` 收紧；
// `count`、`subCount`、`hasMore` 是宽松的计数与分页提示，没有创建电台时 `djRadios` 是空数组。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    djRadios: Schema.Array(UserAudioRadio),
    count: Loose(Schema.Finite),
    hasMore: Loose(Schema.Boolean),
    subCount: Loose(Schema.Finite),
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

const userAudio: ModuleEffect<ModuleInput, ModuleBody> = (query, request) =>
  Effect.gen(function* () {
    const data = {
      userId: query.uid,
    };
    const response = yield* request(
      buildApiRequestIntent(
        `/api/djradio/get/byuser`,
        data,
        createOption(query, 'weapi'),
      ),
    );
    const body = yield* decodeUpstreamBody('user_audio', ModuleBody, response);
    return { ...toModuleResponse(response), body };
  });

/**
 * 用户创建的电台
 */
export default userAudio;
