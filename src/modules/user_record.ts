import { Effect, Schema } from 'effect';

import {
  decodeModuleInput as decodeInput,
  QueryIdentifier as Identifier,
} from '../core/module-input.ts';
import type { ModuleActions } from '../core/request-actions.ts';
import { toModuleResponse } from '../core/response.ts';
import {
  decodeUpstreamBody,
  Loose,
  Optional,
  UpstreamObject,
} from '../core/upstream-body.ts';
import { Song } from '../core/upstream-schemas.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { QueryIdentifier } from '../types/module-shared.ts';

export const moduleActions = {
  request: {
    profile: 'web',
    target: '/api/v1/play/record',
    semantic: 'read',
    cache: 'none',
    retry: 'connect',
  },
} as const satisfies ModuleActions;

export type ModuleInput = {
  uid: QueryIdentifier;

  type?: 0 | 1 | '0' | '1';
};

const inputSchema = Schema.Struct({
  uid: Identifier,
  type: Schema.optional(Schema.Literals([0, 1, '0', '1'])),
});

export const decodeModuleInput = (input: unknown) =>
  decodeInput(inputSchema, input);

const PlayRecord = UpstreamObject({
  playCount: Loose(Schema.Finite),
  score: Loose(Schema.Finite),
  song: Song,
});

// 接口就是为了拿播放记录里的 `song`；`type` 决定返回 `allData` 还是 `weekData`，两个列表都可以没有，出现时歌曲编号收紧。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    allData: Optional(Schema.Array(PlayRecord)),
    weekData: Optional(Schema.Array(PlayRecord)),
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

const userRecord: ModuleEffect<
  ModuleInput,
  ModuleBody,
  typeof moduleActions
> = (query, request) =>
  Effect.gen(function* () {
    const data = {
      uid: query.uid,
      type: query.type || 0, // 1: 最近一周, 0: 所有时间
    };
    const response = yield* request('request', { data });
    const body = yield* decodeUpstreamBody('user_record', ModuleBody, response);
    return { ...toModuleResponse(response), body };
  });

/**
 * 听歌排行
 */
export default userRecord;
