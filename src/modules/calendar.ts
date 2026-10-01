import { Effect } from 'effect';

import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';

const calendar: ModuleEffect<ModuleInput> = (query, request) =>
  Effect.gen(function* () {
    const data = {
      startTime: query.startTime || Date.now(),
      endTime: query.endTime || Date.now(),
    };
    return toModuleResponse(
      yield* request(
        buildApiRequestIntent(
          `/api/mcalendar/detail`,
          data,
          createOption(query, 'weapi'),
        ),
      ),
    );
  });

export default calendar;

export { decodeLegacyModuleInput as decodeModuleInput } from '../core/module-input.ts';

export type ModuleInput = LegacyModuleInput;
