import { Effect, Schema } from 'effect';

import {
  decodeModuleInput as decodeInput,
  NaturalValue,
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
  cursor?: string;
  size?: NaturalValue;
};

const inputSchema = Schema.Struct({
  cursor: Schema.optional(Schema.String),
  size: Schema.optional(NaturalValue),
});

export const decodeModuleInput = (input: unknown) =>
  decodeInput(inputSchema, input);

export const moduleActions = {
  request: {
    profile: 'web',
    target: '/api/yunbei/rcmd/song/history/list',
    semantic: 'read',
    cache: 'none',
    retry: 'connect',
  },
} as const satisfies ModuleActions;

const Page = UpstreamObject({
  more: Loose(Schema.Boolean),
});

// 返回码和推歌历史路径 `data` 收紧；`data.records` 只录到空数组，元素类型未知，未声明并原样透传；
// 分页对象 `page` 宽松。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    data: UpstreamObject({
      page: Loose(Page),
    }),
    message: Loose(Schema.String),
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

const yunbeiRcmdSongHistory: ModuleEffect<
  ModuleInput,
  ModuleBody,
  typeof moduleActions
> = (query, request) =>
  Effect.gen(function* () {
    const data = {
      page: JSON.stringify({
        size: query.size || 20,
        cursor: query.cursor || '',
      }),
    };
    const response = yield* request('request', { data });
    const body = yield* decodeUpstreamBody(
      'yunbei_rcmd_song_history',
      ModuleBody,
      response,
    );
    return { ...toModuleResponse(response), body };
  });

/**
 * 云贝推歌历史记录
 */
export default yunbeiRcmdSongHistory;
