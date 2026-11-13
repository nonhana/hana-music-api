import { Effect, Schema } from 'effect';

import {
  decodeModuleInput as decodeInput,
  NumberLiterals,
} from '../core/module-input.ts';
import type { ModuleActions } from '../core/request-actions.ts';
import { toModuleResponse } from '../core/response.ts';
import {
  decodeUpstreamBody,
  Loose,
  UpstreamObject,
} from '../core/upstream-body.ts';
import { LooseSong } from '../core/upstream-schemas.ts';
import type { ModuleEffect } from '../types/index.ts';

// `type` 的 0–3 由文档和 `clientType` 映射穷举，SDK 编码成上游的客户端名。
export type ModuleInput = { type?: 0 | 1 | 2 | 3 };

const inputSchema = Schema.Struct({
  type: Schema.optional(NumberLiterals([0, 1, 2, 3])),
});

export const decodeModuleInput = (input: unknown) =>
  decodeInput(inputSchema, input);

// PC 和移动端轮播图共用 `targetId`/`targetType`/`typeTitle`/`url`/`s_ctrp`；
// `imageUrl`/`bigImageUrl` 只在 PC 出现，`bannerId`/`pic`/`encodeId`/`showAdTag`/`titleColor`/`bannerBizType`/`exclusive`/`alg`/`scm`/`requestId` 只在移动端出现，都按宽松字段声明。
const Banner = UpstreamObject({
  targetId: Loose(Schema.Finite),
  targetType: Loose(Schema.Finite),
  typeTitle: Loose(Schema.String),
  url: Loose(Schema.String),
  imageUrl: Loose(Schema.String),
  bigImageUrl: Loose(Schema.String),
  bannerId: Loose(Schema.String),
  pic: Loose(Schema.String),
  encodeId: Loose(Schema.String),
  titleColor: Loose(Schema.String),
  bannerBizType: Loose(Schema.String),
  exclusive: Loose(Schema.Boolean),
  showAdTag: Loose(Schema.Boolean),
  alg: Loose(Schema.String),
  scm: Loose(Schema.String),
  requestId: Loose(Schema.String),
  s_ctrp: Loose(Schema.String),
  song: Loose(LooseSong),
});

// 通到轮播图列表的路径 `banners` 收紧；每张图指向的目标编号、展示字段和埋点字段宽松。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    banners: Schema.Array(Banner),
    trp: Loose(UpstreamObject({ rules: Loose(Schema.Array(Schema.String)) })),
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

export const moduleActions = {
  readPc: {
    target: '/api/v2/banner/get',
    profile: 'web',
    semantic: 'read',
    cache: 'none',
    retry: 'connect',
  },
  read: {
    target: '/api/v2/banner/get',
    profile: 'eapi',
    semantic: 'read',
    cache: 'none',
    retry: 'connect',
  },
} as const satisfies ModuleActions;

const banner: ModuleEffect<ModuleInput, ModuleBody, typeof moduleActions> = (
  query,
  request,
) =>
  Effect.gen(function* () {
    const clientTypes = ['pc', 'android', 'iphone', 'ipad'] as const;
    const clientType = clientTypes[query.type ?? 0];
    const response = yield* request(
      (query.type ?? 0) === 0 ? 'readPc' : 'read',
      {
        data: {
          clientType,
        },
      },
    );
    const body = yield* decodeUpstreamBody('banner', ModuleBody, response);
    return { ...toModuleResponse(response), body };
  });

/**
 * 首页轮播图
 */
export default banner;
