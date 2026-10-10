import { Effect, Schema } from 'effect';

import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import { decodeUpstreamBody, UpstreamObject } from '../core/upstream-body.ts';
import { Song } from '../core/upstream-schemas.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';

export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    data: UpstreamObject({
      dailySongs: Schema.Array(Song),
    }),
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

const recommendSongs: ModuleEffect<ModuleInput, ModuleBody> = (
  query,
  request,
) =>
  Effect.gen(function* () {
    const data = {};
    const response = yield* request(
      buildApiRequestIntent(
        `/api/v3/discovery/recommend/songs`,
        data,
        createOption(query, 'weapi'),
      ),
    );
    const body = yield* decodeUpstreamBody(
      'recommend_songs',
      ModuleBody,
      response,
    );
    return {
      ...toModuleResponse(response),
      body,
    };
  });

/**
 * 每日推荐歌曲
 */
export default recommendSongs;

export { decodeLegacyModuleInput as decodeModuleInput } from '../core/module-input.ts';

export type ModuleInput = LegacyModuleInput;
