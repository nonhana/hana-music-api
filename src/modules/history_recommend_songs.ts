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

// 通到历史每日推荐日期的 `data.dates` 收紧；`data.songs` 在登录和匿名录制里都是 `null`，
// 没有非 null 证据、元素类型猜不出，未声明并原样保留。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    data: UpstreamObject({
      dates: Schema.Array(Schema.String),
      purchaseUrl: Loose(Schema.String),
      description: Loose(Schema.String),
      noHistoryMessage: Loose(Schema.String),
    }),
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

const historyRecommendSongs: ModuleEffect<ModuleInput, ModuleBody> = (
  query,
  request,
) =>
  Effect.gen(function* () {
    const data = {};
    const response = yield* request(
      buildApiRequestIntent(
        `/api/discovery/recommend/songs/history/recent`,
        data,
        createOption(query, 'weapi'),
      ),
    );
    const body = yield* decodeUpstreamBody(
      'history_recommend_songs',
      ModuleBody,
      response,
    );
    return { ...toModuleResponse(response), body };
  });

/**
 * 历史每日推荐歌曲
 */
export default historyRecommendSongs;

export { decodeLegacyModuleInput as decodeModuleInput } from '../core/module-input.ts';

export type ModuleInput = LegacyModuleInput;
