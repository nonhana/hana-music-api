import { Effect, Schema } from 'effect';

import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import {
  decodeUpstreamBody,
  Loose,
  UpstreamObject,
} from '../core/upstream-body.ts';
import { MvSummary } from '../core/upstream-schemas.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';

// 通到全部 MV 列表的路径 `data` 和 MV 自己的编号 `data[].id` 收紧（共用 `MvSummary`）；`count` 在非首页缺失、`hasMore` 宽松。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    count: Loose(Schema.Finite),
    data: Schema.Array(MvSummary),
    hasMore: Loose(Schema.Boolean),
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

const mvAll: ModuleEffect<ModuleInput, ModuleBody> = (query, request) =>
  Effect.gen(function* () {
    const data = {
      tags: JSON.stringify({
        地区: query.area || '全部',
        类型: query.type || '全部',
        排序: query.order || '上升最快',
      }),
      offset: query.offset || 0,
      total: 'true',
      limit: query.limit || 30,
    };
    const response = yield* request(
      buildApiRequestIntent(`/api/mv/all`, data, createOption(query)),
    );
    const body = yield* decodeUpstreamBody('mv_all', ModuleBody, response);
    return { ...toModuleResponse(response), body };
  });

/**
 * 全部MV
 */
export default mvAll;

export { decodeLegacyModuleInput as decodeModuleInput } from '../core/module-input.ts';

export type ModuleInput = LegacyModuleInput;
