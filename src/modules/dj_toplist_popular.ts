import { Effect } from 'effect';

import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';

const djToplistPopular: ModuleEffect<ModuleInput> = (query, request) =>
  Effect.gen(function* () {
    const data = {
      limit: query.limit || 100,
      // 不支持 offset
    };
    return toModuleResponse(
      yield* request(
        buildApiRequestIntent(
          `/api/dj/toplist/popular`,
          data,
          createOption(query, 'weapi'),
        ),
      ),
    );
  });

/**
 * 电台最热主播榜
 */
export default djToplistPopular;

export { decodeLegacyModuleInput as decodeModuleInput } from './_input.ts';

export type ModuleInput = LegacyModuleInput;
