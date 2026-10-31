import { Effect, Schema } from 'effect';

import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import {
  decodeUpstreamBody,
  Loose,
  Optional,
  UpstreamObject,
} from '../core/upstream-body.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';

const DynamicCover = UpstreamObject({
  videoPlayUrl: Optional(Schema.String),
  height: Loose(Schema.Finite),
  // 上游字段名就是 weight（不是 width），保留原名。
  weight: Loose(Schema.Finite),
  needTransition: Loose(Schema.Boolean),
});

// 返回码和动态封面路径 `data` 收紧；`data.videoPlayUrl` 是接口要拿的那一项，没有动态封面时整个字段缺失，
// 这时 `data` 是空对象，其余展示字段宽松。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    data: DynamicCover,
    message: Loose(Schema.String),
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

const songDynamicCover: ModuleEffect<ModuleInput, ModuleBody> = (
  query,
  request,
) =>
  Effect.gen(function* () {
    const data = {
      songId: query.id,
    };
    const response = yield* request(
      buildApiRequestIntent(
        `/api/songplay/dynamic-cover`,
        data,
        createOption(query),
      ),
    );
    const body = yield* decodeUpstreamBody(
      'song_dynamic_cover',
      ModuleBody,
      response,
    );
    return {
      ...toModuleResponse(response),
      body,
    };
  });

/**
 * 歌曲动态封面
 */
export default songDynamicCover;

export { decodeLegacyModuleInput as decodeModuleInput } from '../core/module-input.ts';

export type ModuleInput = LegacyModuleInput;
