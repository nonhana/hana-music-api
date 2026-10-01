import { Effect } from 'effect';

import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';

const eventDel: ModuleEffect<ModuleInput> = (query, request) =>
  Effect.gen(function* () {
    const data = {
      id: query.evId,
    };
    return toModuleResponse(
      yield* request(
        buildApiRequestIntent(
          `/api/event/delete`,
          data,
          createOption(query, 'weapi'),
        ),
      ),
    );
  });

/**
 * 删除动态
 */
export default eventDel;

export { decodeLegacyModuleInput as decodeModuleInput } from '../core/module-input.ts';

export type ModuleInput = LegacyModuleInput;
