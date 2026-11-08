import { Effect, Schema } from 'effect';

import type { ModuleActions } from '../core/request-actions.ts';
import { buildActionRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import {
  decodeUpstreamBody,
  Loose,
  UpstreamObject,
} from '../core/upstream-body.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';

// 通到点赞视频列表的路径 `data` 收紧；`data.feeds` 在录制里只见过空数组，元素类型猜不出，没有声明，原样保留。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    message: Loose(Schema.String),
    data: UpstreamObject({
      more: Loose(Schema.Boolean),
      time: Loose(Schema.Finite),
    }),
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

export const moduleActions = {
  read: {
    target: '/api/mlog/playlist/mylike/bytime/get',
    profile: 'web',
    semantic: 'read',
    cache: 'none',
    retry: 'connect',
  },
} as const satisfies ModuleActions;

const playlistMylike: ModuleEffect<ModuleInput, ModuleBody> = (
  query,
  request,
) =>
  Effect.gen(function* () {
    const data = {
      time: query.time || '-1',
      limit: query.limit || '12',
    };
    const response = yield* request(
      buildActionRequestIntent('read', moduleActions.read, data),
    );
    const body = yield* decodeUpstreamBody(
      'playlist_mylike',
      ModuleBody,
      response,
    );
    return { ...toModuleResponse(response), body };
  });

export default playlistMylike;

export { decodeLegacyModuleInput as decodeModuleInput } from '../core/module-input.ts';

export type ModuleInput = LegacyModuleInput;
