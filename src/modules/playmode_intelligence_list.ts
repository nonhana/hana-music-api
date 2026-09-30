import { Effect } from 'effect';

import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';

const playmodeIntelligenceList: ModuleEffect<ModuleInput> = (query, request) =>
  Effect.gen(function* () {
    const data = {
      songId: query.id,
      type: 'fromPlayOne',
      playlistId: query.pid,
      startMusicId: query.sid || query.id,
      count: query.count || 1,
    };
    return toModuleResponse(
      yield* request(
        buildApiRequestIntent(
          `/api/playmode/intelligence/list`,
          data,
          createOption(query),
        ),
      ),
    );
  });

/**
 * 智能播放
 */
export default playmodeIntelligenceList;

export { decodeLegacyModuleInput as decodeModuleInput } from './_input.ts';

export type ModuleInput = LegacyModuleInput;
