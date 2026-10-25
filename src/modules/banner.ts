import { Effect, Schema } from 'effect';

import { InvalidModuleInput } from '../core/errors.ts';
import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import {
  decodeUpstreamBody,
  Loose,
  UpstreamObject,
} from '../core/upstream-body.ts';
import { LooseSong } from '../core/upstream-schemas.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';

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

const banner: ModuleEffect<ModuleInput, ModuleBody> = (query, request) =>
  Effect.gen(function* () {
    if (
      query.type !== undefined &&
      query.type !== null &&
      typeof query.type !== 'string' &&
      typeof query.type !== 'number' &&
      typeof query.type !== 'boolean'
    ) {
      return yield* new InvalidModuleInput({
        message: 'type must be a primitive value',
      });
    }
    const clientTypeMap: Record<string, string> = {
      0: 'pc',
      1: 'android',
      2: 'iphone',
      3: 'ipad',
    };
    const type = clientTypeMap[String(query.type ?? 0)] || 'pc';
    const response = yield* request(
      buildApiRequestIntent(
        `/api/v2/banner/get`,
        { clientType: type },
        createOption(query),
      ),
    );
    const body = yield* decodeUpstreamBody('banner', ModuleBody, response);
    return { ...toModuleResponse(response), body };
  });

/**
 * 首页轮播图
 */
export default banner;

export { decodeLegacyModuleInput as decodeModuleInput } from '../core/module-input.ts';

export type ModuleInput = LegacyModuleInput;
