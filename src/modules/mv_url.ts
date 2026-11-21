import * as Effect from 'effect/Effect';
import * as Schema from 'effect/Schema';

import {
  decodeModuleInput as decodeInput,
  NaturalValue,
  NumberId,
} from '../core/module-input.ts';
import type { ModuleActions } from '../core/request-actions.ts';
import { toModuleResponse } from '../core/response.ts';
import type { BodyType } from '../core/upstream-body.ts';
import {
  decodeUpstreamBody,
  defineModuleBody,
  Loose,
  UpstreamObject,
} from '../core/upstream-body.ts';
import type { ModuleEffect } from '../types/index.ts';

export type ModuleInput = {
  id: NumberId;
  r?: number;
};

const inputSchema = Schema.Struct({
  id: NumberId,
  r: Schema.optional(NaturalValue),
});

export const decodeModuleInput = (input: unknown) =>
  decodeInput(inputSchema, input);

export const moduleActions = {
  request: {
    profile: 'web',
    target: '/api/song/enhance/play/mv/url',
    semantic: 'read',
    cache: 'none',
    retry: 'connect',
  },
} as const satisfies ModuleActions;

const MvUrl = UpstreamObject({
  code: Schema.Finite,
  expi: Loose(Schema.Finite),
  fee: Loose(Schema.Finite),
  id: Schema.Finite,
  md5: Loose(Schema.String),
  msg: Loose(Schema.String),
  mvFee: Loose(Schema.Finite),
  r: Loose(Schema.Finite),
  size: Loose(Schema.Finite),
  st: Loose(Schema.Finite),
  url: Schema.NullOr(Schema.String),
});

// 通到 MV 播放地址的路径 `data`、视频编号 `data.id`、地址 `data.url` 和单项返回码 `data.code` 收紧；拿不到地址时 `url` 是 null。
export const ModuleBody = /* @__PURE__ */ defineModuleBody(
  UpstreamObject({
    code: Schema.Literal(200),
    data: MvUrl,
  }),
);
export type ModuleBody = BodyType<typeof ModuleBody>;

const mvUrl: ModuleEffect<ModuleInput, ModuleBody, typeof moduleActions> = (
  query,
  request,
) =>
  Effect.gen(function* () {
    const data = {
      id: query.id,
      r: query.r || 1080,
    };
    const response = yield* request('request', { data });
    const body = yield* decodeUpstreamBody('mv_url', ModuleBody, response);
    return { ...toModuleResponse(response), body };
  });

/**
 * MV链接
 */
export default mvUrl;
