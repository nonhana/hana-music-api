import { Effect, Schema } from 'effect';

import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import { decodeUpstreamBody, UpstreamObject } from '../core/upstream-body.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';

// 返回码、签到状态路径 `data` 及连续签到天数 `days` 和当天获得的云贝 `shells` 收紧。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    data: UpstreamObject({
      days: Schema.Finite,
      shells: Schema.Finite,
    }),
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

const yunbei: ModuleEffect<ModuleInput, ModuleBody> = (query, request) =>
  Effect.gen(function* () {
    const data = {};
    const response = yield* request(
      buildApiRequestIntent(
        `/api/point/signed/get`,
        data,
        createOption(query, 'weapi'),
      ),
    );
    const body = yield* decodeUpstreamBody('yunbei', ModuleBody, response);
    return { ...toModuleResponse(response), body };
  });

/**
 * 云贝签到状态
 */
export default yunbei;

export { decodeLegacyModuleInput as decodeModuleInput } from '../core/module-input.ts';

export type ModuleInput = LegacyModuleInput;
