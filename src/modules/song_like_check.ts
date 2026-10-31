import { Effect, Schema } from 'effect';

import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import { decodeUpstreamBody, UpstreamObject } from '../core/upstream-body.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';

// 返回码和喜欢列表 `ids` 收紧；`ids` 里是这个账号已喜爱的歌曲编号，没喜欢过任何一首时是空数组。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    ids: Schema.Array(Schema.Finite),
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

const songLikeCheck: ModuleEffect<ModuleInput, ModuleBody> = (query, request) =>
  Effect.gen(function* () {
    const data = {
      trackIds: query.ids,
    };
    const response = yield* request(
      buildApiRequestIntent(`/api/song/like/check`, data, createOption(query)),
    );
    const body = yield* decodeUpstreamBody(
      'song_like_check',
      ModuleBody,
      response,
    );
    return {
      ...toModuleResponse(response),
      body,
    };
  });

/**
 * 歌曲是否喜爱
 */
export default songLikeCheck;

export { decodeLegacyModuleInput as decodeModuleInput } from '../core/module-input.ts';

export type ModuleInput = LegacyModuleInput;
