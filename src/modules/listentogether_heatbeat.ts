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
  request: {
    profile: 'eapi',
    target: '/api/listen/together/heartbeat',
    semantic: 'write',
    cache: 'none',
    retry: 'never',
  },
} as const satisfies ModuleActions;

// 接口就是为了确认心跳上报成功：正文顶层的返回码 `code` 收紧；`data` 里的结果标志和
// 时间提示、`message` 都是附带信息，宽松（`data.message` 只见过 `null`，不声明）。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    data: Loose(
      UpstreamObject({
        result: Loose(Schema.Boolean),
        time: Loose(Schema.Finite),
        timeSpan: Loose(Schema.Finite),
      }),
    ),
    message: Loose(Schema.String),
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

const listentogetherHeatbeat: ModuleEffect<
  ModuleInput,
  ModuleBody,
  typeof moduleActions
> = (query, request) =>
  Effect.gen(function* () {
    const data = {
      roomId: query.roomId,
      songId: query.songId,
      playStatus: query.playStatus,
      progress: query.progress,
    };
    const response = yield* request('request', { data });
    const body = yield* decodeUpstreamBody(
      'listentogether_heatbeat',
      ModuleBody,
      response,
    );
    return { ...toModuleResponse(response), body };
  });

/**
 * 一起听 发送心跳
 */
export default listentogetherHeatbeat;

export { decodeLegacyModuleInput as decodeModuleInput } from '../core/module-input.ts';

export type ModuleInput = LegacyModuleInput;
