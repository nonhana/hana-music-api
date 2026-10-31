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

const HotSearchDetail = UpstreamObject({
  searchWord: Schema.String,
  alg: Loose(Schema.String),
  score: Loose(Schema.Finite),
  content: Loose(Schema.String),
  source: Loose(Schema.Finite),
  iconType: Loose(Schema.Finite),
  iconUrl: Loose(Schema.String),
  url: Loose(Schema.String),
});

// 通到热搜详情列表的路径 `data`；每条记录的 `searchWord` 是热搜词，是接口要返回的那一项。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    data: Schema.Array(HotSearchDetail),
    message: Loose(Schema.String),
    trp: Loose(UpstreamObject({ rules: Loose(Schema.Array(Schema.String)) })),
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

const searchHotDetail: ModuleEffect<ModuleInput, ModuleBody> = (
  query,
  request,
) =>
  Effect.gen(function* () {
    const data = {};
    const response = yield* request(
      buildApiRequestIntent(
        `/api/hotsearchlist/get`,
        data,
        createOption(query, 'weapi'),
      ),
    );
    const body = yield* decodeUpstreamBody(
      'search_hot_detail',
      ModuleBody,
      response,
    );
    return { ...toModuleResponse(response), body };
  });

/**
 * 热搜列表
 */
export default searchHotDetail;

export { decodeLegacyModuleInput as decodeModuleInput } from '../core/module-input.ts';

export type ModuleInput = LegacyModuleInput;
