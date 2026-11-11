import { Effect, Schema } from 'effect';

import {
  decodeModuleInput as decodeInput,
  NumberLiterals,
} from '../core/module-input.ts';
import type { ModuleActions } from '../core/request-actions.ts';
import { toModuleResponse } from '../core/response.ts';
import {
  decodeUpstreamBody,
  Loose,
  UpstreamObject,
} from '../core/upstream-body.ts';
import type { ModuleEffect } from '../types/index.ts';

export type ModuleInput = {
  id: string;
  t?: 0 | 1;
};

const inputSchema = Schema.Struct({
  id: Schema.String,
  t: Schema.optional(NumberLiterals([0, 1])),
});

export const decodeModuleInput = (input: unknown) =>
  decodeInput(inputSchema, input);

export const moduleActions = {
  sub: {
    profile: 'web',
    target: '/api/cloudvideo/video/sub',
    semantic: 'write',
    cache: 'none',
    retry: 'never',
  },
  unsub: {
    profile: 'web',
    target: '/api/cloudvideo/video/unsub',
    semantic: 'write',
    cache: 'none',
    retry: 'never',
  },
} as const satisfies ModuleActions;

// 接口就是为了确认收藏/取消收藏成功：正文顶层的返回码 `code` 收紧；`message` 是附带提示，宽松
// （`data`、`debugInfo`、`failData` 只见过 `null`，不声明）。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    message: Loose(Schema.String),
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

const videoSub: ModuleEffect<ModuleInput, ModuleBody, typeof moduleActions> = (
  input,
  request,
) =>
  Effect.gen(function* () {
    const action = input.t === 1 ? 'sub' : 'unsub';
    const data = {
      id: input.id,
    };
    const response = yield* request(action, { data });
    return {
      ...toModuleResponse(response),
      body: yield* decodeUpstreamBody('video_sub', ModuleBody, response),
    };
  });

/**
 * 收藏与取消收藏视频
 */
export default videoSub;
