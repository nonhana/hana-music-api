import { Effect } from 'effect';

import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';

const videoTimelineAll: ModuleEffect<ModuleInput> = (query, request) =>
  Effect.gen(function* () {
    const data = {
      groupId: 0,
      offset: query.offset || 0,
      need_preview_url: 'true',
      total: true,
    };
    //   /api/videotimeline/otherclient/get
    return toModuleResponse(
      yield* request(
        buildApiRequestIntent(
          `/api/videotimeline/otherclient/get`,
          data,
          createOption(query, 'weapi'),
        ),
      ),
    );
  });

/**
 * 全部视频列表
 */
export default videoTimelineAll;

export { decodeLegacyModuleInput as decodeModuleInput } from '../core/module-input.ts';

export type ModuleInput = LegacyModuleInput;
