import { Effect, Schema } from 'effect';

import {
  decodeModuleInput as decodeInput,
  NumberId,
} from '../core/module-input.ts';
import type { ModuleActions } from '../core/request-actions.ts';
import { toModuleResponse } from '../core/response.ts';
import {
  decodeUpstreamBody,
  Loose,
  UpstreamObject,
} from '../core/upstream-body.ts';
import type { ModuleEffect } from '../types/index.ts';

// 视频 id 既可能是数字编号，也可能是十六进制串；纯数字串按编号校验，其余按不透明字符串保留。
export type ModuleInput = { id: NumberId | string };

const inputSchema = Schema.Struct({
  id: Schema.Union([NumberId, Schema.String.check(Schema.isPattern(/\D/u))]),
});

export const decodeModuleInput = (input: unknown) =>
  decodeInput(inputSchema, input);

export const moduleActions = {
  request: {
    profile: 'web',
    target: '/api/cloudvideo/v1/allvideo/rcmd',
    semantic: 'read',
    cache: 'none',
    retry: 'connect',
  },
} as const satisfies ModuleActions;

// 通到相关视频列表的路径 `data` 在本批录制里始终是空数组，元素类型无法确定，未声明并原样保留；`message` 宽松。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    message: Loose(Schema.String),
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

const relatedAllvideo: ModuleEffect<
  ModuleInput,
  ModuleBody,
  typeof moduleActions
> = (query, request) =>
  Effect.gen(function* () {
    const data = {
      id: query.id,
      type: /^\d+$/.test(String(query.id)) ? 0 : 1,
    };
    const response = yield* request('request', { data });
    const body = yield* decodeUpstreamBody(
      'related_allvideo',
      ModuleBody,
      response,
    );
    return { ...toModuleResponse(response), body };
  });

/**
 * 相关视频
 */
export default relatedAllvideo;
