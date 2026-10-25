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

const RedCount = UpstreamObject({
  count: Schema.Finite,
  countDesc: Loose(Schema.String),
});

// 返回码、红心数量路径 `data` 和接口要拿的 `data.count` 收紧；`countDesc` 只是展示文案，宽松。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    data: RedCount,
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

const songRedCount: ModuleEffect<ModuleInput, ModuleBody> = (query, request) =>
  Effect.gen(function* () {
    const data = {
      songId: query.id,
    };
    const response = yield* request(
      buildApiRequestIntent(`/api/song/red/count`, data, createOption(query)),
    );
    const body = yield* decodeUpstreamBody(
      'song_red_count',
      ModuleBody,
      response,
    );
    return {
      ...toModuleResponse(response),
      body,
    };
  });

/**
 * 歌曲红心数量
 */
export default songRedCount;

export { decodeLegacyModuleInput as decodeModuleInput } from '../core/module-input.ts';

export type ModuleInput = LegacyModuleInput;
