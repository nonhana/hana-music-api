import { Effect } from 'effect';

import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';

const yunbeiRcmdSongHistory: ModuleEffect<ModuleInput> = (query, request) =>
  Effect.gen(function* () {
    const data = {
      page: JSON.stringify({
        size: query.size || 20,
        cursor: query.cursor || '',
      }),
    };
    return toModuleResponse(
      yield* request(
        buildApiRequestIntent(
          `/api/yunbei/rcmd/song/history/list`,
          data,
          createOption(query, 'weapi'),
        ),
      ),
    );
  });

/**
 * 云贝推歌历史记录
 */
export default yunbeiRcmdSongHistory;

export { decodeLegacyModuleInput as decodeModuleInput } from '../core/module-input.ts';

export type ModuleInput = LegacyModuleInput;
