import { Effect, Schema } from 'effect';

import type { ModuleActions } from '../core/request-actions.ts';
import { toModuleResponse } from '../core/response.ts';
import { decodeUpstreamBody, UpstreamObject } from '../core/upstream-body.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';

export const moduleActions = {
  sub: {
    profile: 'web',
    target: '/api/djradio/sub',
    semantic: 'write',
    cache: 'none',
    retry: 'never',
  },
  unsub: {
    profile: 'web',
    target: '/api/djradio/unsub',
    semantic: 'write',
    cache: 'none',
    retry: 'never',
  },
} as const satisfies ModuleActions;

// 接口就是为了确认订阅/取消订阅成功：正文只带返回码 `code`，收紧。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

const djSub: ModuleEffect<ModuleInput, ModuleBody, typeof moduleActions> = (
  input,
  request,
) =>
  Effect.gen(function* () {
    const query = { ...input };
    const action = Number(query.t) === 1 ? 'sub' : 'unsub';
    const data = {
      id: query.rid,
    };
    const response = yield* request(action, { data });
    return {
      ...toModuleResponse(response),
      body: yield* decodeUpstreamBody('dj_sub', ModuleBody, response),
    };
  });

/**
 * 订阅与取消电台
 */
export default djSub;

export { decodeLegacyModuleInput as decodeModuleInput } from '../core/module-input.ts';

export type ModuleInput = LegacyModuleInput;
