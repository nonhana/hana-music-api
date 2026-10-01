import { Effect } from 'effect';

import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';

const recommendSongsDislike: ModuleEffect<ModuleInput> = (query, request) =>
  Effect.gen(function* () {
    const data = {
      resId: query.id, // 日推歌曲id
      resType: 4,
      sceneType: 1,
    };
    return toModuleResponse(
      yield* request(
        buildApiRequestIntent(
          `/api/v2/discovery/recommend/dislike`,
          data,
          createOption(query, 'weapi'),
        ),
      ),
    );
  });

/**
 * 每日推荐歌曲-不感兴趣
 */
export default recommendSongsDislike;

export { decodeLegacyModuleInput as decodeModuleInput } from '../core/module-input.ts';

export type ModuleInput = LegacyModuleInput;
