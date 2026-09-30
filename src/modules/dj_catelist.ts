import { Effect } from 'effect';

import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';

const djCatelist: ModuleEffect<ModuleInput> = (query, request) =>
  Effect.gen(function* () {
    return toModuleResponse(
      yield* request(
        buildApiRequestIntent(
          `/api/djradio/category/get`,
          {},
          createOption(query, 'weapi'),
        ),
      ),
    );
  });

/**
 * 电台分类列表
 */
export default djCatelist;

export { decodeLegacyModuleInput as decodeModuleInput } from './_input.ts';

export type ModuleInput = LegacyModuleInput;
