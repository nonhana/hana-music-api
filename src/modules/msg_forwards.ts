import { Effect } from 'effect';

import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';

const msgForwards: ModuleEffect<ModuleInput> = (query, request) =>
  Effect.gen(function* () {
    const data = {
      offset: query.offset || 0,
      limit: query.limit || 30,
      total: 'true',
    };
    return toModuleResponse(
      yield* request(
        buildApiRequestIntent(
          `/api/forwards/get`,
          data,
          createOption(query, 'weapi'),
        ),
      ),
    );
  });

/**
 * @我
 */
export default msgForwards;

export { decodeLegacyModuleInput as decodeModuleInput } from './_input.ts';

export type ModuleInput = LegacyModuleInput;
