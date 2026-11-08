import { Effect, Schema } from 'effect';

import type { ModuleActions } from '../core/request-actions.ts';
import { buildActionRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import {
  decodeUpstreamBody,
  Loose,
  UpstreamObject,
} from '../core/upstream-body.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';

export const moduleActions = {
  request: {
    profile: 'weapiPc',
    target: '/api/djradio/home/paygift/list',
    semantic: 'read',
    cache: 'none',
    retry: 'connect',
  },
} as const satisfies ModuleActions;

const PaidRadio = UpstreamObject({
  id: Schema.Finite,
  alg: Loose(Schema.String),
  discountPrice: Loose(Schema.Finite),
  feeScope: Loose(Schema.Finite),
  lastProgramName: Loose(Schema.String),
  name: Loose(Schema.String),
  originalPrice: Loose(Schema.Finite),
  picUrl: Loose(Schema.String),
  programCount: Loose(Schema.Finite),
  radioFeeType: Loose(Schema.Finite),
  rcmdText: Loose(Schema.String),
  subCount: Loose(Schema.Finite),
  subed: Loose(Schema.Boolean),
});

const PaidRadioPage = UpstreamObject({
  list: Schema.Array(PaidRadio),
  hasMore: Loose(Schema.Boolean),
});

// 通到付费电台列表的路径 `data.list` 和每个电台的编号 `data.list[].id` 收紧；`hasMore` 宽松，`msg` 只见过 null，未声明。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    data: PaidRadioPage,
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

const djPaygift: ModuleEffect<ModuleInput, ModuleBody> = (query, request) =>
  Effect.gen(function* () {
    const data = {
      limit: query.limit || 30,
      offset: query.offset || 0,
      _nmclfl: 1,
    };
    const response = yield* request(
      buildActionRequestIntent('request', moduleActions['request'], data),
    );
    const body = yield* decodeUpstreamBody('dj_paygift', ModuleBody, response);
    return { ...toModuleResponse(response), body };
  });

/**
 * 付费电台
 */
export default djPaygift;

export { decodeLegacyModuleInput as decodeModuleInput } from '../core/module-input.ts';

export type ModuleInput = LegacyModuleInput;
