import { Effect, Schema } from 'effect';

import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import {
  decodeUpstreamBody,
  Optional,
  UpstreamObject,
} from '../core/upstream-body.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';

const Lyric = UpstreamObject({
  lyricUrl: Schema.String,
});

// 返回码和通到歌词的 `data` 收紧；没有歌词的声音 `data` 是 `null`，按可以没有处理，出现时 `data.lyricUrl` 仍收紧。
// `source` 和 `message` 在录制里只见过 `null`，不声明，原样保留。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    data: Optional(Lyric),
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

const voiceLyric: ModuleEffect<ModuleInput, ModuleBody> = (query, request) =>
  Effect.gen(function* () {
    const data = {
      programId: query.id,
    };
    const response = yield* request(
      buildApiRequestIntent(`/api/voice/lyric/get`, data, createOption(query)),
    );
    const body = yield* decodeUpstreamBody('voice_lyric', ModuleBody, response);
    return { ...toModuleResponse(response), body };
  });

/**
 * 获取声音歌词
 */
export default voiceLyric;

export { decodeLegacyModuleInput as decodeModuleInput } from '../core/module-input.ts';

export type ModuleInput = LegacyModuleInput;
