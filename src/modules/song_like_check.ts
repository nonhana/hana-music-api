import { Effect } from 'effect';

import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';

const songLikeCheck: ModuleEffect<ModuleInput> = (query, request) =>
  Effect.gen(function* () {
    const data = {
      trackIds: query.ids,
    };
    return toModuleResponse(
      yield* request(
        buildApiRequestIntent(
          `/api/song/like/check`,
          data,
          createOption(query),
        ),
      ),
    );
  });

/**
 * 歌曲是否喜爱
 */
export default songLikeCheck;

export { decodeLegacyModuleInput as decodeModuleInput } from './_input.ts';

export type ModuleInput = LegacyModuleInput;
