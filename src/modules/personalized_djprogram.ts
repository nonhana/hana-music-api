import { Effect } from 'effect';

import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';

const personalizedDjprogram: ModuleEffect<ModuleInput> = (query, request) =>
  Effect.gen(function* () {
    return toModuleResponse(
      yield* request(
        buildApiRequestIntent(
          `/api/personalized/djprogram`,
          {},
          createOption(query, 'weapi'),
        ),
      ),
    );
  });

/**
 * 推荐电台
 */
export default personalizedDjprogram;

export { decodeLegacyModuleInput as decodeModuleInput } from './_input.ts';

export type ModuleInput = LegacyModuleInput;
