import { Effect } from 'effect';

import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';

const playlistSubscribers: ModuleEffect<ModuleInput> = (query, request) =>
  Effect.gen(function* () {
    const data = {
      id: query.id,
      limit: query.limit || 20,
      offset: query.offset || 0,
    };
    return toModuleResponse(
      yield* request(
        buildApiRequestIntent(
          `/api/playlist/subscribers`,
          data,
          createOption(query),
        ),
      ),
    );
  });

/**
 * 歌单收藏者
 */
export default playlistSubscribers;

export { decodeLegacyModuleInput as decodeModuleInput } from './_input.ts';

export type ModuleInput = LegacyModuleInput;
