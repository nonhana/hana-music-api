import { Effect, Schema } from 'effect';

import type { ModuleActions } from '../core/request-actions.ts';
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
    profile: 'web',
    target: '/api/djradio/hot/v1',
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

// 通到热门电台列表的路径 `djRadios` 和每个电台的编号 `djRadios[].id` 收紧；主播记录和其余字段宽松。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    djRadios: Schema.Array(Radio),
    hasMore: Loose(Schema.Boolean),
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

const djHot: ModuleEffect<ModuleInput, ModuleBody, typeof moduleActions> = (
  query,
  request,
) =>
  Effect.gen(function* () {
    const data = {
      limit: query.limit || 30,
      offset: query.offset || 0,
    };
    const response = yield* request('request', { data });
    const body = yield* decodeUpstreamBody('dj_hot', ModuleBody, response);
    return { ...toModuleResponse(response), body };
  });

/**
 * 热门电台
 */
export default djHot;

export { decodeLegacyModuleInput as decodeModuleInput } from '../core/module-input.ts';

export type ModuleInput = LegacyModuleInput;
