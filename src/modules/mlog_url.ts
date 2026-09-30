import { Effect } from 'effect';

import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';

const mlogUrl: ModuleEffect<ModuleInput> = (query, request) =>
  Effect.gen(function* () {
    const data = {
      id: query.id,
      resolution: query.res || 1080,
      type: 1,
    };
    return toModuleResponse(
      yield* request(
        buildApiRequestIntent(
          `/api/mlog/detail/v1`,
          data,
          createOption(query, 'weapi'),
        ),
      ),
    );
  });

/**
 * mlog链接
 */
export default mlogUrl;

export { decodeLegacyModuleInput as decodeModuleInput } from './_input.ts';

export type ModuleInput = LegacyModuleInput;
