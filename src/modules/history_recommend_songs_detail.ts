import { Effect } from 'effect';

import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';

const historyRecommendSongsDetail: ModuleEffect<ModuleInput> = (
  query,
  request,
) =>
  Effect.gen(function* () {
    const data = {
      date: query.date || '',
    };
    return toModuleResponse(
      yield* request(
        buildApiRequestIntent(
          `/api/discovery/recommend/songs/history/detail`,
          data,
          createOption(query, 'weapi'),
        ),
      ),
    );
  });

/**
 * 历史每日推荐歌曲详情
 */
export default historyRecommendSongsDetail;

export { decodeLegacyModuleInput as decodeModuleInput } from '../core/module-input.ts';

export type ModuleInput = LegacyModuleInput;
