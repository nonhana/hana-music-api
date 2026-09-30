import { Effect } from 'effect';

import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';

const recommendResource: ModuleEffect<ModuleInput> = (query, request) =>
  Effect.gen(function* () {
    return toModuleResponse(
      yield* request(
        buildApiRequestIntent(
          `/api/v1/discovery/recommend/resource`,
          {},
          createOption(query, 'weapi'),
        ),
      ),
    );
  });

/**
 * 每日推荐歌单
 */
export default recommendResource;

export { decodeLegacyModuleInput as decodeModuleInput } from './_input.ts';

export type ModuleInput = LegacyModuleInput;
