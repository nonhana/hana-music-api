import * as Effect from 'effect/Effect';
import * as Schema from 'effect/Schema';

import {
  decodeModuleInput as decodeInput,
  IntegerValue,
  NaturalValue,
  NumberId,
} from '../core/module-input.ts';
import type { ModuleActions } from '../core/request-actions.ts';
import { toModuleResponse } from '../core/response.ts';
import type { BodyType } from '../core/upstream-body.ts';
import {
  decodeUpstreamBody,
  defineModuleBody,
  Loose,
  UpstreamObject,
} from '../core/upstream-body.ts';
import type { ModuleEffect } from '../types/index.ts';

// 摘录条目字段来自文档示例和录制，四列同时出现；未声明的额外字段会被拒绝。
const LyricsMark = Schema.Struct({
  originalLyricsText: Schema.String,
  startTimeStamp: NaturalValue,
  translateLyricsText: Schema.String,
  translateType: IntegerValue,
});

export type ModuleInput = {
  id: NumberId;
  markId?: NumberId;
  marks?: ReadonlyArray<typeof LyricsMark.Type>;
};

const inputSchema = Schema.Struct({
  id: NumberId,
  markId: Schema.optional(NumberId),
  marks: LyricsMark.pipe(Schema.Array, Schema.optional),
});

export const decodeModuleInput = (input: unknown) =>
  decodeInput(inputSchema, input);

const LyricsMarkResult = UpstreamObject({
  markId: Schema.Finite,
  success: Loose(Schema.Boolean),
  updateTime: Loose(Schema.Finite),
});

// 返回码、摘录结果 `data` 和这条摘录自己的 `markId` 收紧；`success`、`updateTime` 宽松。
export const ModuleBody = /* @__PURE__ */ defineModuleBody(
  UpstreamObject({
    code: Schema.Literal(200),
    data: LyricsMarkResult,
    message: Loose(Schema.String),
  }),
);
export type ModuleBody = BodyType<typeof ModuleBody>;

export const moduleActions = {
  add: {
    target: '/api/song/play/lyrics/mark/add',
    profile: 'eapi',
    semantic: 'write',
    cache: 'none',
    retry: 'never',
  },
} as const satisfies ModuleActions;

const songLyricsMarkAdd: ModuleEffect<
  ModuleInput,
  ModuleBody,
  typeof moduleActions
> = (query, request) =>
  Effect.gen(function* () {
    const data = {
      songId: query.id,
      markId: query.markId ?? '',
      data: JSON.stringify(query.marks ?? []),
    };
    const response = yield* request('add', { data });
    return {
      ...toModuleResponse(response),
      body: yield* decodeUpstreamBody(
        'song_lyrics_mark_add',
        ModuleBody,
        response,
      ),
    };
  });

/**
 * 歌词摘录 - 添加/修改摘录歌词
 */
export default songLyricsMarkAdd;
