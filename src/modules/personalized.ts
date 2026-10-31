import { Effect, Schema } from 'effect';

import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import {
  decodeUpstreamBody,
  Loose,
  UpstreamObject,
} from '../core/upstream-body.ts';
import { PlaylistSummary } from '../core/upstream-schemas.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';

// 推荐歌单卡片的字段比 `PlaylistSummary` 少（没有 `creator`、`subscribed` 等），卡片特有字段另声明。
const RecommendedPlaylist = UpstreamObject({
  ...PlaylistSummary.schema.fields,
  alg: Loose(Schema.String),
  canDislike: Loose(Schema.Boolean),
  copywriter: Loose(Schema.String),
  picUrl: Loose(Schema.String),
  type: Loose(Schema.Finite),
});

// 通到推荐歌单的路径 `result` 和每个歌单自己的编号 `result[].id` 收紧（共用 `PlaylistSummary`）；`category`、`hasTaste` 和卡片其余字段宽松。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    result: Schema.Array(RecommendedPlaylist),
    category: Loose(Schema.Finite),
    hasTaste: Loose(Schema.Boolean),
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

const personalized: ModuleEffect<ModuleInput, ModuleBody> = (query, request) =>
  Effect.gen(function* () {
    const data = {
      limit: query.limit || 30,
      // offset: query.offset || 0,
      total: true,
      n: 1000,
    };
    const response = yield* request(
      buildApiRequestIntent(
        `/api/personalized/playlist`,
        data,
        createOption(query, 'weapi'),
      ),
    );
    const body = yield* decodeUpstreamBody(
      'personalized',
      ModuleBody,
      response,
    );
    return { ...toModuleResponse(response), body };
  });

/**
 * 推荐歌单
 */
export default personalized;

export { decodeLegacyModuleInput as decodeModuleInput } from '../core/module-input.ts';

export type ModuleInput = LegacyModuleInput;
