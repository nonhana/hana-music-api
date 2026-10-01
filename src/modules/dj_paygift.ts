import { Effect } from 'effect';

import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';

const djPaygift: ModuleEffect<ModuleInput> = (query, request) =>
  Effect.gen(function* () {
    const data = {
      limit: query.limit || 30,
      offset: query.offset || 0,
      _nmclfl: 1,
    };
    return toModuleResponse(
      yield* request(
        buildApiRequestIntent(
          `/api/djradio/home/paygift/list`,
          data,
          createOption(query, 'weapi'),
        ),
      ),
    );
  });

/**
 * 付费电台
 */
export default djPaygift;

export { decodeLegacyModuleInput as decodeModuleInput } from '../core/module-input.ts';

export type ModuleInput = LegacyModuleInput;
