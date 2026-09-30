import { Effect } from 'effect';

import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';

const eventForward: ModuleEffect<ModuleInput> = (query, request) =>
  Effect.gen(function* () {
    const data = {
      forwards: query.forwards,
      id: query.evId,
      eventUserId: query.uid,
    };
    return toModuleResponse(
      yield* request(
        buildApiRequestIntent(`/api/event/forward`, data, createOption(query)),
      ),
    );
  });

/**
 * 转发动态
 */
export default eventForward;

export { decodeLegacyModuleInput as decodeModuleInput } from './_input.ts';

export type ModuleInput = LegacyModuleInput;
