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

const LyricsMarkResult = UpstreamObject({
  markId: Schema.Finite,
  success: Loose(Schema.Boolean),
  updateTime: Loose(Schema.Finite),
});

// 返回码、摘录结果 `data` 和这条摘录自己的 `markId` 收紧；`success`、`updateTime` 宽松。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    data: LyricsMarkResult,
    message: Loose(Schema.String),
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

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
      markId: query.markId || '',
      data: query.data || '[]',
      // "[{\"translateType\":1,\"startTimeStamp\":800,\"translateLyricsText\":\"让我逃走吧、声音已经枯萎\",\"originalLyricsText\":\"逃がしてくれって声を枯らした\"},{\"translateType\":1,\"startTimeStamp\":4040,\"translateLyricsText\":\"我的愿望究竟会实现吗\",\"originalLyricsText\":\"あたしの願いなど叶うでしょうか\"}]"
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

export { decodeLegacyModuleInput as decodeModuleInput } from '../core/module-input.ts';

export type ModuleInput = LegacyModuleInput;
