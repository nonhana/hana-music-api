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

// 相似 MV 记录复用 `MvSummary`，另声明录制里非 null 的 `alg`；`desc` 只见过 null，未声明。
const SimiMv = UpstreamObject({
  ...MvSummary.schema.fields,
  alg: Loose(Schema.String),
});

// 通到相似 MV 列表的路径 `mvs` 和每个 MV 的编号收紧（复用 `SimiMv`）；其余字段宽松。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    mvs: Schema.Array(SimiMv),
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

const simiMv: ModuleEffect<ModuleInput, ModuleBody> = (query, request) =>
  Effect.gen(function* () {
    const data = {
      mvid: query.mvid,
    };
    const response = yield* request(
      buildApiRequestIntent(
        `/api/discovery/simiMV`,
        data,
        createOption(query, 'weapi'),
      ),
    );
    const body = yield* decodeUpstreamBody('simi_mv', ModuleBody, response);
    return { ...toModuleResponse(response), body };
  });

/**
 * 相似MV
 */
export default simiMv;

export { decodeLegacyModuleInput as decodeModuleInput } from '../core/module-input.ts';

export type ModuleInput = LegacyModuleInput;
