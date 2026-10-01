import { Effect } from 'effect';

import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';

const topMv: ModuleEffect<ModuleInput> = (query, request) =>
  Effect.gen(function* () {
    const data = {
      area: query.area || '',
      limit: query.limit || 30,
      offset: query.offset || 0,
      total: true,
    };
    return toModuleResponse(
      yield* request(
        buildApiRequestIntent(
          `/api/mv/toplist`,
          data,
          createOption(query, 'weapi'),
        ),
      ),
    );
  });

/**
 * MV排行榜
 */
export default topMv;

export { decodeLegacyModuleInput as decodeModuleInput } from '../core/module-input.ts';

export type ModuleInput = LegacyModuleInput;
