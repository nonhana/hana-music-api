import { Effect, Schema } from 'effect';

import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import { decodeUpstreamBody, UpstreamObject } from '../core/upstream-body.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';

const Suggestion = UpstreamObject({
  id: Schema.Finite,
  name: Schema.String,
});

// 默认按类别给 songs、artists、albums，type 为 mobile 时只给关键词 allMatch；哪一类没有建议就整个缺失，都没有时 result 是空对象。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    result: UpstreamObject({
      songs: Schema.optionalKey(Schema.Array(Suggestion)),
      artists: Schema.optionalKey(Schema.Array(Suggestion)),
      albums: Schema.optionalKey(Schema.Array(Suggestion)),
      allMatch: Schema.optionalKey(
        Schema.Array(UpstreamObject({ keyword: Schema.String })),
      ),
    }),
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

const searchSuggest: ModuleEffect<ModuleInput, ModuleBody> = (query, request) =>
  Effect.gen(function* () {
    const data = {
      s: query.keywords || '',
    };
    const type = query.type === 'mobile' ? 'keyword' : 'web';
    const response = yield* request(
      buildApiRequestIntent(
        `/api/search/suggest/` + type,
        data,
        createOption(query, 'weapi'),
      ),
    );
    const body = yield* decodeUpstreamBody(
      'search_suggest',
      ModuleBody,
      response,
    );
    return {
      ...toModuleResponse(response),
      body,
    };
  });

/**
 * 搜索建议
 */
export default searchSuggest;

export { decodeLegacyModuleInput as decodeModuleInput } from '../core/module-input.ts';

export type ModuleInput = LegacyModuleInput;
