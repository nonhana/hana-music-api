import { Effect, Schema } from 'effect';

import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import {
  decodeUpstreamBody,
  Loose,
  UpstreamObject,
} from '../core/upstream-body.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';

const Banner = UpstreamObject({
  exclusive: Loose(Schema.Boolean),
  pic: Loose(Schema.String),
  targetId: Loose(Schema.Finite),
  targetType: Loose(Schema.Finite),
  typeTitle: Loose(Schema.String),
  url: Loose(Schema.String),
});

// 通到电台 banner 列表的路径 `data` 收紧，接口就是为了拿这份 banner 列表；banner 指向的目标编号和展示字段宽松。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    data: Schema.Array(Banner),
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

const djBanner: ModuleEffect<ModuleInput, ModuleBody> = (query, request) =>
  Effect.gen(function* () {
    const response = yield* request(
      buildApiRequestIntent(
        `/api/djradio/banner/get`,
        {},
        createOption(query, 'weapi'),
      ),
    );
    const body = yield* decodeUpstreamBody('dj_banner', ModuleBody, response);
    return { ...toModuleResponse(response), body };
  });

/**
 * 电台banner
 */
export default djBanner;

export { decodeLegacyModuleInput as decodeModuleInput } from '../core/module-input.ts';

export type ModuleInput = LegacyModuleInput;
