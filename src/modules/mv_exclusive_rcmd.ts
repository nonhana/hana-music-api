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

// 通到网易出品 MV 列表的路径 `data` 和 MV 自己的编号 `data[].id` 收紧（共用 `MvSummary`）；`more` 宽松。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    data: Schema.Array(MvSummary),
    more: Loose(Schema.Boolean),
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

const mvExclusiveRcmd: ModuleEffect<ModuleInput, ModuleBody> = (
  query,
  request,
) =>
  Effect.gen(function* () {
    const data = {
      offset: query.offset || 0,
      limit: query.limit || 30,
    };
    const response = yield* request(
      buildApiRequestIntent(
        `/api/mv/exclusive/rcmd`,
        data,
        createOption(query),
      ),
    );
    const body = yield* decodeUpstreamBody(
      'mv_exclusive_rcmd',
      ModuleBody,
      response,
    );
    return { ...toModuleResponse(response), body };
  });

/**
 * 网易出品
 */
export default mvExclusiveRcmd;

export { decodeLegacyModuleInput as decodeModuleInput } from '../core/module-input.ts';

export type ModuleInput = LegacyModuleInput;
