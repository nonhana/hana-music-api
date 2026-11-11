import { Effect, Schema } from 'effect';

import {
  decodeModuleInput as decodeInput,
  NumberId,
} from '../core/module-input.ts';
import type { ModuleActions } from '../core/request-actions.ts';
import { toModuleResponse } from '../core/response.ts';
import { decodeUpstreamBody, UpstreamObject } from '../core/upstream-body.ts';
import type { ModuleEffect } from '../types/index.ts';

export const moduleActions = {
  request: {
    profile: 'web',
    target: '/api/event/delete',
    semantic: 'write',
    cache: 'none',
    retry: 'never',
  },
} as const satisfies ModuleActions;

export type ModuleInput = {
  evId: NumberId;
};

const inputSchema = Schema.Struct({
  evId: NumberId,
});

export const decodeModuleInput = (input: unknown) =>
  decodeInput(inputSchema, input);

// 接口就是为了确认删除成功：正文只返回返回码 `code`，收紧；本批录制是删除不存在 id 的返回体，只证明成功返回码，其他字段未声明。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({ code: Schema.Literal(200) }),
);
export type ModuleBody = typeof ModuleBody.Type;

const eventDel: ModuleEffect<ModuleInput, ModuleBody, typeof moduleActions> = (
  query,
  request,
) =>
  Effect.gen(function* () {
    const data = {
      id: query.evId,
    };
    const response = yield* request('request', { data });
    const body = yield* decodeUpstreamBody('event_del', ModuleBody, response);
    return { ...toModuleResponse(response), body };
  });

/**
 * 删除动态
 */
export default eventDel;
