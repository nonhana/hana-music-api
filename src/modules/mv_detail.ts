import { Effect } from 'effect';

import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';

const mvDetail: ModuleEffect<ModuleInput> = (query, request) =>
  Effect.gen(function* () {
    const data = {
      id: query.mvid,
    };
    return toModuleResponse(
      yield* request(
        buildApiRequestIntent(
          `/api/v1/mv/detail`,
          data,
          createOption(query, 'weapi'),
        ),
      ),
    );
  });

/**
 * MV详情
 */
export default mvDetail;

export { decodeLegacyModuleInput as decodeModuleInput } from '../core/module-input.ts';

export type ModuleInput = LegacyModuleInput;
