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

const SearchDefaultData = UpstreamObject({
  showKeyword: Schema.String,
  realkeyword: Schema.String,
  styleKeyword: Loose(
    UpstreamObject({
      keyWord: Loose(Schema.String),
    }),
  ),
  action: Loose(Schema.Finite),
  alg: Loose(Schema.String),
  bizQueryInfo: Loose(Schema.String),
  gap: Loose(Schema.Finite),
  searchType: Loose(Schema.Finite),
});

// 通到默认搜索关键词的路径 `data`；`showKeyword`（展示词）和 `realkeyword`（实际搜索词）是接口要返回的那一项。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    data: SearchDefaultData,
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

const searchDefault: ModuleEffect<ModuleInput, ModuleBody> = (query, request) =>
  Effect.gen(function* () {
    const response = yield* request(
      buildApiRequestIntent(
        `/api/search/defaultkeyword/get`,
        {},
        createOption(query),
      ),
    );
    const body = yield* decodeUpstreamBody(
      'search_default',
      ModuleBody,
      response,
    );
    return { ...toModuleResponse(response), body };
  });

/**
 * 默认搜索关键词
 */
export default searchDefault;

export { decodeLegacyModuleInput as decodeModuleInput } from '../core/module-input.ts';

export type ModuleInput = LegacyModuleInput;
