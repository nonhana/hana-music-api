import { Effect, Schema } from 'effect';

import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import { decodeUpstreamBody, UpstreamObject } from '../core/upstream-body.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';

const Lyric = UpstreamObject({ lyric: Schema.String });

// 逐行歌词 lrc 一直在，没收录时 lyric 是空串；其余形式可能整个缺失，也可能在、但 lyric 是空串。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    lrc: Lyric,
    tlyric: Schema.optionalKey(Lyric),
    romalrc: Schema.optionalKey(Lyric),
    yrc: Schema.optionalKey(Lyric),
    ytlrc: Schema.optionalKey(Lyric),
    yromalrc: Schema.optionalKey(Lyric),
    pureMusic: Schema.optionalKey(Schema.Boolean),
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

const lyricNew: ModuleEffect<ModuleInput, ModuleBody> = (query, request) =>
  Effect.gen(function* () {
    const data = {
      id: query.id,
      cp: false,
      tv: 0,
      lv: 0,
      rv: 0,
      kv: 0,
      yv: 0,
      ytv: 0,
      yrv: 0,
    };
    const response = yield* request(
      buildApiRequestIntent(`/api/song/lyric/v1`, data, createOption(query)),
    );
    const body = yield* decodeUpstreamBody('lyric_new', ModuleBody, response);
    return {
      ...toModuleResponse(response),
      body,
    };
  });

/**
 * 新版歌词 - 包含逐字歌词
 */
export default lyricNew;

export { decodeLegacyModuleInput as decodeModuleInput } from '../core/module-input.ts';

export type ModuleInput = LegacyModuleInput;
