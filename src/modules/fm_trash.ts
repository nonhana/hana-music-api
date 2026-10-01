import { Effect } from 'effect';

import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';

const fmTrash: ModuleEffect<ModuleInput> = (query, request) =>
  Effect.gen(function* () {
    const data = {
      songId: query.id,
      alg: 'RT',
      time: query.time || 25,
    };
    return toModuleResponse(
      yield* request(
        buildApiRequestIntent(
          `/api/radio/trash/add`,
          data,
          createOption(query, 'weapi'),
        ),
      ),
    );
  });

/**
 * 垃圾桶
 */
export default fmTrash;

export { decodeLegacyModuleInput as decodeModuleInput } from '../core/module-input.ts';

export type ModuleInput = LegacyModuleInput;
