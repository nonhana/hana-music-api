import { Effect, Schema } from 'effect';

import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import {
  decodeUpstreamBody,
  Loose,
  UpstreamObject,
} from '../core/upstream-body.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';

const LyricsMarkDeleteResult = UpstreamObject({
  success: Schema.Boolean,
});

// 返回码、删除结果 `data` 和 `data.success` 收紧：删除已不存在的摘录时返回码仍是 200，只有
// `success` 能区分这次调用有没有删到；`message` 宽松。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    data: LyricsMarkDeleteResult,
    message: Loose(Schema.String),
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

const songLyricsMarkDel: ModuleEffect<ModuleInput, ModuleBody> = (
  query,
  request,
) =>
  Effect.gen(function* () {
    const data = {
      markIds: query.id,
    };
    const response = yield* request(
      buildApiRequestIntent(
        `/api/song/play/lyrics/mark/del`,
        data,
        createOption(query),
      ),
    );
    return {
      ...toModuleResponse(response),
      body: yield* decodeUpstreamBody(
        'song_lyrics_mark_del',
        ModuleBody,
        response,
      ),
    };
  });

/**
 * 歌词摘录 - 删除摘录歌词
 */
export default songLyricsMarkDel;

export { decodeLegacyModuleInput as decodeModuleInput } from '../core/module-input.ts';

export type ModuleInput = LegacyModuleInput;
