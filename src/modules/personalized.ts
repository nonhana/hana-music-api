import { Effect } from 'effect';

import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';

const personalized: ModuleEffect<ModuleInput> = (query, request) =>
  Effect.gen(function* () {
    const data = {
      limit: query.limit || 30,
      // offset: query.offset || 0,
      total: true,
      n: 1000,
    };
    return toModuleResponse(
      yield* request(
        buildApiRequestIntent(
          `/api/personalized/playlist`,
          data,
          createOption(query, 'weapi'),
        ),
      ),
    );
  });

/**
 * 推荐歌单
 */
export default personalized;

export { decodeLegacyModuleInput as decodeModuleInput } from '../core/module-input.ts';

export type ModuleInput = LegacyModuleInput;
