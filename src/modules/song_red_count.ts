import { Effect } from 'effect';

import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';

const songRedCount: ModuleEffect<ModuleInput> = (query, request) =>
  Effect.gen(function* () {
    const data = {
      songId: query.id,
    };
    return toModuleResponse(
      yield* request(
        buildApiRequestIntent(`/api/song/red/count`, data, createOption(query)),
      ),
    );
  });

/**
 * 歌曲红心数量
 */
export default songRedCount;

export { decodeLegacyModuleInput as decodeModuleInput } from './_input.ts';

export type ModuleInput = LegacyModuleInput;
