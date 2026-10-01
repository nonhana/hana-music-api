import { Effect } from 'effect';

import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';

const mvSublist: ModuleEffect<ModuleInput> = (query, request) =>
  Effect.gen(function* () {
    const data = {
      limit: query.limit || 25,
      offset: query.offset || 0,
      total: true,
    };
    return toModuleResponse(
      yield* request(
        buildApiRequestIntent(
          `/api/cloudvideo/allvideo/sublist`,
          data,
          createOption(query, 'weapi'),
        ),
      ),
    );
  });

/**
 * 已收藏MV列表
 */
export default mvSublist;

export { decodeLegacyModuleInput as decodeModuleInput } from '../core/module-input.ts';

export type ModuleInput = LegacyModuleInput;
