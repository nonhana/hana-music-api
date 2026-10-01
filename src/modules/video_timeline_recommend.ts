import { Effect } from 'effect';

import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';

const videoTimelineRecommend: ModuleEffect<ModuleInput> = (query, request) =>
  Effect.gen(function* () {
    const data = {
      offset: query.offset || 0,
      filterLives: '[]',
      withProgramInfo: 'true',
      needUrl: '1',
      resolution: '480',
    };
    return toModuleResponse(
      yield* request(
        buildApiRequestIntent(
          `/api/videotimeline/get`,
          data,
          createOption(query, 'weapi'),
        ),
      ),
    );
  });

/**
 * 推荐视频
 */
export default videoTimelineRecommend;

export { decodeLegacyModuleInput as decodeModuleInput } from '../core/module-input.ts';

export type ModuleInput = LegacyModuleInput;
