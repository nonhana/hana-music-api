import { Effect } from 'effect';

import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';

const artistVideo: ModuleEffect<ModuleInput> = (query, request) =>
  Effect.gen(function* () {
    const data = {
      artistId: query.id,
      page: JSON.stringify({
        size: query.size || 10,
        cursor: query.cursor || 0,
      }),
      tab: 0,
      order: query.order || 0,
    };
    return toModuleResponse(
      yield* request(
        buildApiRequestIntent(
          `/api/mlog/artist/video`,
          data,
          createOption(query, 'weapi'),
        ),
      ),
    );
  });

/**
 * 歌手相关视频
 */
export default artistVideo;

export { decodeLegacyModuleInput as decodeModuleInput } from '../core/module-input.ts';

export type ModuleInput = LegacyModuleInput;
