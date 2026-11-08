import { Effect, Schema } from 'effect';

import type { ModuleActions } from '../core/request-actions.ts';
import { buildActionRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import { decodeUpstreamBody, UpstreamObject } from '../core/upstream-body.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';

export const moduleActions = {
  request: {
    profile: 'weapiPc',
    target: '/api/point/today/get',
    semantic: 'read',
    cache: 'none',
    retry: 'connect',
  },
} as const satisfies ModuleActions;

// 返回码、今日云贝路径 `data` 及当天获得的云贝 `shells` 收紧。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    data: UpstreamObject({
      shells: Schema.Finite,
    }),
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

const yunbeiToday: ModuleEffect<ModuleInput, ModuleBody> = (_query, request) =>
  Effect.gen(function* () {
    const data = {};
    const response = yield* request(
      buildActionRequestIntent('request', moduleActions['request'], data),
    );
    const body = yield* decodeUpstreamBody(
      'yunbei_today',
      ModuleBody,
      response,
    );
    return { ...toModuleResponse(response), body };
  });

/**
 * 今日云贝
 */
export default yunbeiToday;

export { decodeLegacyModuleInput as decodeModuleInput } from '../core/module-input.ts';

export type ModuleInput = LegacyModuleInput;
