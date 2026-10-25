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

const HotSearch = UpstreamObject({
  first: Schema.String,
  second: Loose(Schema.Finite),
  iconType: Loose(Schema.Finite),
});

// 通到热门搜索词列表的路径 `result.hots`；每条记录的 `first` 就是热搜词，是接口要返回的那一项。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    result: UpstreamObject({
      hots: Schema.Array(HotSearch),
    }),
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

const searchHot: ModuleEffect<ModuleInput, ModuleBody> = (query, request) =>
  Effect.gen(function* () {
    const data = {
      type: 1111,
    };
    const response = yield* request(
      buildApiRequestIntent(`/api/search/hot`, data, createOption(query)),
    );
    const body = yield* decodeUpstreamBody('search_hot', ModuleBody, response);
    return { ...toModuleResponse(response), body };
  });

/**
 * 热门搜索
 */
export default searchHot;

export { decodeLegacyModuleInput as decodeModuleInput } from '../core/module-input.ts';

export type ModuleInput = LegacyModuleInput;
