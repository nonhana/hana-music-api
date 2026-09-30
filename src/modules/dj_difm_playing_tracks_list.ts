import { Effect } from 'effect';

import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';

const djDifmPlayingTracksList: ModuleEffect<ModuleInput> = (query, request) =>
  Effect.gen(function* () {
    const data = {
      limit: query.limit || 5,
      source: query.source || 0,
      channelId: query.channelId,
    };
    return toModuleResponse(
      yield* request(
        buildApiRequestIntent(
          `/api/dj/difm/playing/tracks/list`,
          data,
          createOption(query),
        ),
      ),
    );
  });

/**
 * DIFM电台 - 播放列表
 */
export default djDifmPlayingTracksList;

export { decodeLegacyModuleInput as decodeModuleInput } from './_input.ts';

export type ModuleInput = LegacyModuleInput;
