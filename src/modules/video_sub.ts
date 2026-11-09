import { Effect, Schema } from 'effect';

import type { ModuleActions } from '../core/request-actions.ts';
import { toModuleResponse } from '../core/response.ts';
import {
  decodeUpstreamBody,
  Loose,
  UpstreamObject,
} from '../core/upstream-body.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';

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
    const query = { ...input };
    const action = Number(query.t) === 1 ? 'sub' : 'unsub';
    const data = {
      id: query.id,
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

export { decodeLegacyModuleInput as decodeModuleInput } from '../core/module-input.ts';

export type ModuleInput = LegacyModuleInput;
