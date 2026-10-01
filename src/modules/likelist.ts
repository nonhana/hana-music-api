import { Effect } from 'effect';

import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';

const likelist: ModuleEffect<ModuleInput> = (query, request) =>
  Effect.gen(function* () {
    const data = {
      uid: query.uid,
    };
    return toModuleResponse(
      yield* request(
        buildApiRequestIntent(`/api/song/like/get`, data, createOption(query)),
      ),
    );
  });

/**
 * 喜欢的歌曲(无序)
 */
export default likelist;

export { decodeLegacyModuleInput as decodeModuleInput } from '../core/module-input.ts';

export type ModuleInput = LegacyModuleInput;
