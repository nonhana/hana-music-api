import { Effect, Schema } from 'effect';

import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import { decodeUpstreamBody, UpstreamObject } from '../core/upstream-body.ts';
import { MvSummary } from '../core/upstream-schemas.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';

// 通到最新 MV 列表的路径 `data` 和 MV 自己的编号 `data[].id` 收紧（共用 `MvSummary`）；筛选不到时 `data` 是空数组。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    data: Schema.Array(MvSummary),
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

const mvFirst: ModuleEffect<ModuleInput, ModuleBody> = (query, request) =>
  Effect.gen(function* () {
    const data = {
      // 'offset': query.offset || 0,
      area: query.area || '',
      limit: query.limit || 30,
      total: true,
    };
    const response = yield* request(
      buildApiRequestIntent(`/api/mv/first`, data, createOption(query)),
    );
    const body = yield* decodeUpstreamBody('mv_first', ModuleBody, response);
    return { ...toModuleResponse(response), body };
  });

/**
 * 最新MV
 */
export default mvFirst;

export { decodeLegacyModuleInput as decodeModuleInput } from '../core/module-input.ts';

export type ModuleInput = LegacyModuleInput;
