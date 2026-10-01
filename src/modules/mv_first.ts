import { Effect } from 'effect';

import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';

const mvFirst: ModuleEffect<ModuleInput> = (query, request) =>
  Effect.gen(function* () {
    const data = {
      // 'offset': query.offset || 0,
      area: query.area || '',
      limit: query.limit || 30,
      total: true,
    };
    return toModuleResponse(
      yield* request(
        buildApiRequestIntent(`/api/mv/first`, data, createOption(query)),
      ),
    );
  });

/**
 * 最新MV
 */
export default mvFirst;

export { decodeLegacyModuleInput as decodeModuleInput } from '../core/module-input.ts';

export type ModuleInput = LegacyModuleInput;
