import { Effect } from 'effect';

import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';

const musicianPlayTrend: ModuleEffect<ModuleInput> = (query, request) =>
  Effect.gen(function* () {
    const data = {
      startTime: query.startTime,
      endTime: query.endTime,
    };
    return toModuleResponse(
      yield* request(
        buildApiRequestIntent(
          `/api/creator/musician/play/count/statistic/data/trend/get`,
          data,
          createOption(query, 'weapi'),
        ),
      ),
    );
  });

/**
 * 音乐人歌曲播放趋势
 */
export default musicianPlayTrend;

export { decodeLegacyModuleInput as decodeModuleInput } from './_input.ts';

export type ModuleInput = LegacyModuleInput;
