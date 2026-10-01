import { Effect } from 'effect';

import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';

const searchMultimatch: ModuleEffect<ModuleInput> = (query, request) =>
  Effect.gen(function* () {
    const data = {
      type: query.type || 1,
      s: query.keywords || '',
    };
    return toModuleResponse(
      yield* request(
        buildApiRequestIntent(
          `/api/search/suggest/multimatch`,
          data,
          createOption(query, 'weapi'),
        ),
      ),
    );
  });

/**
 * 多类型搜索
 */
export default searchMultimatch;

export { decodeLegacyModuleInput as decodeModuleInput } from '../core/module-input.ts';

export type ModuleInput = LegacyModuleInput;
