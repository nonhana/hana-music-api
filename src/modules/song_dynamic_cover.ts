import { Effect } from 'effect';

import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';

const songDynamicCover: ModuleEffect<ModuleInput> = (query, request) =>
  Effect.gen(function* () {
    const data = {
      songId: query.id,
    };
    return toModuleResponse(
      yield* request(
        buildApiRequestIntent(
          `/api/songplay/dynamic-cover`,
          data,
          createOption(query),
        ),
      ),
    );
  });

/**
 * 歌曲动态封面
 */
export default songDynamicCover;

export { decodeLegacyModuleInput as decodeModuleInput } from './_input.ts';

export type ModuleInput = LegacyModuleInput;
