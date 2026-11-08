import { Effect, Schema } from 'effect';

import type { ModuleActions } from '../core/request-actions.ts';
import { buildActionRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import {
  decodeUpstreamBody,
  Loose,
  UpstreamObject,
} from '../core/upstream-body.ts';
import { PlaylistUser } from '../core/upstream-schemas.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';

export const moduleActions = {
  request: {
    profile: 'weapiPc',
    target: '/api/djradio/recommend/v1',
    semantic: 'read',
    cache: 'none',
    retry: 'connect',
  },
} as const satisfies ModuleActions;

const Radio = UpstreamObject({
  id: Schema.Finite,
  buyed: Loose(Schema.Boolean),
  category: Loose(Schema.String),
  categoryId: Loose(Schema.Finite),
  copywriter: Loose(Schema.String),
  createTime: Loose(Schema.Finite),
  dj: Loose(PlaylistUser),
  feeScope: Loose(Schema.Finite),
  name: Loose(Schema.String),
  picUrl: Loose(Schema.String),
  playCount: Loose(Schema.Finite),
  programCount: Loose(Schema.Finite),
  radioFeeType: Loose(Schema.Finite),
  rcmdtext: Loose(Schema.String),
  subCount: Loose(Schema.Finite),
  subed: Loose(Schema.Boolean),
});

// 通到精选电台列表的路径 `djRadios` 和每个电台的编号 `djRadios[].id` 收紧；`name` 和其余字段宽松。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    djRadios: Schema.Array(Radio),
    name: Loose(Schema.String),
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

const djRecommend: ModuleEffect<ModuleInput, ModuleBody> = (_query, request) =>
  Effect.gen(function* () {
    const response = yield* request(
      buildActionRequestIntent('request', moduleActions['request'], {}),
    );
    const body = yield* decodeUpstreamBody(
      'dj_recommend',
      ModuleBody,
      response,
    );
    return { ...toModuleResponse(response), body };
  });

/**
 * 精选电台
 */
export default djRecommend;

export { decodeLegacyModuleInput as decodeModuleInput } from '../core/module-input.ts';

export type ModuleInput = LegacyModuleInput;
