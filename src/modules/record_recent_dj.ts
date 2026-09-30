import { Effect } from 'effect';

import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';

const recordRecentDj: ModuleEffect<ModuleInput> = (query, request) =>
  Effect.gen(function* () {
    const data = {
      limit: query.limit || 100,
    };
    return toModuleResponse(
      yield* request(
        buildApiRequestIntent(
          `/api/play-record/djradio/list`,
          data,
          createOption(query, 'weapi'),
        ),
      ),
    );
  });

export default recordRecentDj;

export { decodeLegacyModuleInput as decodeModuleInput } from './_input.ts';

export type ModuleInput = LegacyModuleInput;
