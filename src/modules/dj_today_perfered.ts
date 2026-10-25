import { Effect, Schema } from 'effect';

import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import { decodeUpstreamBody, UpstreamObject } from '../core/upstream-body.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';

// 只收紧返回码。`data` 在匿名、登录和 page 0/1/99 的探测里都是空数组，元素类型没有证据，
// 未声明并原样保留；`msg` 只见过 null，同样没有声明。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

const djTodayPerfered: ModuleEffect<ModuleInput, ModuleBody> = (
  query,
  request,
) =>
  Effect.gen(function* () {
    const data = {
      page: query.page || 0,
    };
    const response = yield* request(
      buildApiRequestIntent(
        `/api/djradio/home/today/perfered`,
        data,
        createOption(query, 'weapi'),
      ),
    );
    const body = yield* decodeUpstreamBody(
      'dj_today_perfered',
      ModuleBody,
      response,
    );
    return { ...toModuleResponse(response), body };
  });

/**
 * 电台今日优选
 */
export default djTodayPerfered;

export { decodeLegacyModuleInput as decodeModuleInput } from '../core/module-input.ts';

export type ModuleInput = LegacyModuleInput;
