import { Effect } from 'effect';

import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';

const searchDefault: ModuleEffect<ModuleInput> = (query, request) =>
  Effect.gen(function* () {
    return toModuleResponse(
      yield* request(
        buildApiRequestIntent(
          `/api/search/defaultkeyword/get`,
          {},
          createOption(query),
        ),
      ),
    );
  });

/**
 * 默认搜索关键词
 */
export default searchDefault;

export { decodeLegacyModuleInput as decodeModuleInput } from './_input.ts';

export type ModuleInput = LegacyModuleInput;
