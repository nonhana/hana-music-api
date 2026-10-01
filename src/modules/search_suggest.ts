import { Effect } from 'effect';

import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';

const searchSuggest: ModuleEffect<ModuleInput> = (query, request) =>
  Effect.gen(function* () {
    const data = {
      s: query.keywords || '',
    };
    const type = query.type === 'mobile' ? 'keyword' : 'web';
    return toModuleResponse(
      yield* request(
        buildApiRequestIntent(
          `/api/search/suggest/` + type,
          data,
          createOption(query, 'weapi'),
        ),
      ),
    );
  });

/**
 * 搜索建议
 */
export default searchSuggest;

export { decodeLegacyModuleInput as decodeModuleInput } from '../core/module-input.ts';

export type ModuleInput = LegacyModuleInput;
