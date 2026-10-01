import { Effect } from 'effect';

import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';

const videoUrl: ModuleEffect<ModuleInput> = (query, request) =>
  Effect.gen(function* () {
    const data = {
      ids: '["' + query.id + '"]',
      resolution: query.res || 1080,
    };
    return toModuleResponse(
      yield* request(
        buildApiRequestIntent(
          `/api/cloudvideo/playurl`,
          data,
          createOption(query, 'weapi'),
        ),
      ),
    );
  });

/**
 * 视频链接
 */
export default videoUrl;

export { decodeLegacyModuleInput as decodeModuleInput } from '../core/module-input.ts';

export type ModuleInput = LegacyModuleInput;
