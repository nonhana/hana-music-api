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

// 通到某天历史每日推荐的 `data.songs` 和每首歌的 `id` 收紧；`data.dates` 只见过空数组、
// `data.description` 只见过 null，未声明并原样保留。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    data: UpstreamObject({
      songs: Schema.Array(Song),
      purchaseUrl: Loose(Schema.String),
      noHistoryMessage: Loose(Schema.String),
    }),
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

const historyRecommendSongsDetail: ModuleEffect<ModuleInput, ModuleBody> = (
  query,
  request,
) =>
  Effect.gen(function* () {
    const data = {
      date: query.date || '',
    };
    const response = yield* request(
      buildApiRequestIntent(
        `/api/discovery/recommend/songs/history/detail`,
        data,
        createOption(query, 'weapi'),
      ),
    );
    const body = yield* decodeUpstreamBody(
      'history_recommend_songs_detail',
      ModuleBody,
      response,
    );
    return { ...toModuleResponse(response), body };
  });

/**
 * 历史每日推荐歌曲详情
 */
export default historyRecommendSongsDetail;

export { decodeLegacyModuleInput as decodeModuleInput } from '../core/module-input.ts';

export type ModuleInput = LegacyModuleInput;
