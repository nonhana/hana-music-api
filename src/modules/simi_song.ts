import { Effect } from 'effect';

import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';

const simiSong: ModuleEffect<ModuleInput> = (query, request) =>
  Effect.gen(function* () {
    const data = {
      songid: query.id,
      limit: query.limit || 50,
      offset: query.offset || 0,
    };
    return toModuleResponse(
      yield* request(
        buildApiRequestIntent(
          `/api/v1/discovery/simiSong`,
          data,
          createOption(query, 'weapi'),
        ),
      ),
    );
  });

/**
 * 相似歌曲
 */
export default simiSong;

export { decodeLegacyModuleInput as decodeModuleInput } from '../core/module-input.ts';

export type ModuleInput = LegacyModuleInput;
