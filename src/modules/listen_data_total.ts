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
    target: '/api/content/activity/listen/data/total',
    semantic: 'read',
    cache: 'none',
    retry: 'connect',
  },
} as const satisfies ModuleActions;

// 通到总收听时长的路径 `data.totalDuration` 收紧（接口就是为了拿这一项）；`message` 宽松。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    data: UpstreamObject({
      totalDuration: Schema.Finite,
    }),
    message: Loose(Schema.String),
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

const listenDataTotal: ModuleEffect<
  ModuleInput,
  ModuleBody,
  typeof moduleActions
> = (_query, request) =>
  Effect.gen(function* () {
    const response = yield* request('request', { data: {} });
    const body = yield* decodeUpstreamBody(
      'listen_data_total',
      ModuleBody,
      response,
    );
    return { ...toModuleResponse(response), body };
  });

/**
 * 听歌足迹 - 总收听时长
 */
export default listenDataTotal;

export { decodeLegacyModuleInput as decodeModuleInput } from '../core/module-input.ts';

export type ModuleInput = LegacyModuleInput;
