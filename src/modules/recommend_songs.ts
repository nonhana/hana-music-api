import { Effect, Schema } from 'effect';

import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import {
  decodeUpstreamBody,
  Loose,
  UpstreamObject,
} from '../core/upstream-body.ts';
import { Song } from '../core/upstream-schemas.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';

const RecommendReason = UpstreamObject({
  reason: Loose(Schema.String),
  reasonId: Loose(Schema.String),
  songId: Loose(Schema.Finite),
});

// 通到每日歌曲列表的路径、每首歌的编号收紧；其余字段宽松。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    data: UpstreamObject({
      dailySongs: Schema.Array(Song),
      algReturnDemote: Loose(Schema.Boolean),
      demote: Loose(Schema.Boolean),
      fromCache: Loose(Schema.Boolean),
      recommendReasons: Loose(Schema.Array(RecommendReason)),
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
