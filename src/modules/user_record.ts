import * as Effect from 'effect/Effect';
import * as Schema from 'effect/Schema';

import {
  decodeModuleInput as decodeInput,
  NumberId,
  NumberLiterals,
} from '../core/module-input.ts';
import type { ModuleActions } from '../core/request-actions.ts';
import { toModuleResponse } from '../core/response.ts';
import type { BodyType } from '../core/upstream-body.ts';
import {
  decodeUpstreamBody,
  defineModuleBody,
  Loose,
  Optional,
  UpstreamObject,
} from '../core/upstream-body.ts';
import { Song } from '../core/upstream-schemas.ts';
import type { ModuleEffect } from '../types/index.ts';

export const moduleActions = {
  request: {
    profile: 'web',
    target: '/api/v1/play/record',
    semantic: 'read',
    cache: 'none',
    retry: 'connect',
  },
} as const satisfies ModuleActions;

const RecordType = NumberLiterals([0, 1]);

export type ModuleInput = {
  uid: NumberId;
  type?: 0 | 1;
};

const inputSchema = Schema.Struct({
  uid: NumberId,
  type: Schema.optional(RecordType),
});

export const decodeModuleInput = (input: unknown) =>
  decodeInput(inputSchema, input);

const PlayRecord = UpstreamObject({
  playCount: Loose(Schema.Finite),
  score: Loose(Schema.Finite),
  song: Song,
});

// 接口就是为了拿播放记录里的 `song`；`type` 决定返回 `allData` 还是 `weekData`，两个列表都可以没有，出现时歌曲编号收紧。
export const ModuleBody = /* @__PURE__ */ defineModuleBody(
  UpstreamObject({
    code: Schema.Literal(200),
    allData: PlayRecord.pipe(Schema.Array, Optional),
    weekData: PlayRecord.pipe(Schema.Array, Optional),
  }),
);
export type ModuleBody = BodyType<typeof ModuleBody>;

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
