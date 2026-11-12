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
import { LooseSong } from '../core/upstream-schemas.ts';
import type { ModuleEffect } from '../types/index.ts';

export type ModuleInput = { limit?: number; offset?: number };

const inputSchema = Schema.Struct({
  limit: Schema.optional(NaturalValue),
  offset: Schema.optional(NaturalValue),
});

export const decodeModuleInput = (input: unknown) =>
  decodeInput(inputSchema, input);

const MonthDownloadRecord = UpstreamObject({
  firstTime: Loose(Schema.Finite),
  id: Schema.Finite,
  song: Loose(LooseSong),
  type: Loose(Schema.Finite),
});

// 返回码、本月下载记录列表的路径 `info` 和每条记录自己的编号 `info[].id` 收紧；内嵌歌曲 `song` 和展示字段宽松。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    info: Schema.Array(MonthDownloadRecord),
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

export const moduleActions = {
  read: {
    target: '/api/member/song/monthdownlist',
    profile: 'eapi',
    semantic: 'read',
    cache: 'none',
    retry: 'connect',
  },
} as const satisfies ModuleActions;

const songMonthdownlist: ModuleEffect<
  ModuleInput,
  ModuleBody,
  typeof moduleActions
> = (query, request) =>
  Effect.gen(function* () {
    const data = {
      limit: String(query.limit || 20),
      offset: String(query.offset || 0),
      total: 'true',
    };
    const response = yield* request('read', { data });
    const body = yield* decodeUpstreamBody(
      'song_monthdownlist',
      ModuleBody,
      response,
    );
    return { ...toModuleResponse(response), body };
  });

/**
 * 会员本月下载歌曲记录
 */
export default songMonthdownlist;
