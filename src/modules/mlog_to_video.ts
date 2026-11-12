import { Effect, Schema } from 'effect';

import { decodeModuleInput as decodeInput } from '../core/module-input.ts';
import type { ModuleActions } from '../core/request-actions.ts';
import { toModuleResponse } from '../core/response.ts';
import {
  decodeUpstreamBody,
  Loose,
  UpstreamObject,
} from '../core/upstream-body.ts';
import type { ModuleEffect } from '../types/index.ts';

export const moduleActions = {
  request: {
    profile: 'web',
    target: '/api/mlog/video/convert/id',
    semantic: 'read',
    cache: 'none',
    retry: 'connect',
  },
} as const satisfies ModuleActions;

// mlog id 是不透明字符串（如 a1PvyoDUbEJmk0），不是数字编号。
export type ModuleInput = { id: string };

const inputSchema = Schema.Struct({ id: Schema.String });

export const decodeModuleInput = (input: unknown) =>
  decodeInput(inputSchema, input);

// 返回码和接口要拿的那一项视频 id `data` 收紧；`message` 宽松。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    data: Schema.String,
    message: Loose(Schema.String),
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

const mlogToVideo: ModuleEffect<
  ModuleInput,
  ModuleBody,
  typeof moduleActions
> = (input, request) =>
  Effect.gen(function* () {
    const data = {
      mlogId: input.id,
    };
    const response = yield* request('request', { data });
    const body = yield* decodeUpstreamBody(
      'mlog_to_video',
      ModuleBody,
      response,
    );
    return { ...toModuleResponse(response), body };
  });

/**
 * 将mlog id转为video id
 */
export default mlogToVideo;
