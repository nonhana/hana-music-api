import { Effect } from 'effect';

import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';

const searchHotDetail: ModuleEffect<ModuleInput> = (query, request) =>
  Effect.gen(function* () {
    const data = {};
    return toModuleResponse(
      yield* request(
        buildApiRequestIntent(
          `/api/hotsearchlist/get`,
          data,
          createOption(query, 'weapi'),
        ),
      ),
    );
  });

/**
 * 热搜列表
 */
export default searchHotDetail;

export { decodeLegacyModuleInput as decodeModuleInput } from './_input.ts';

export type ModuleInput = LegacyModuleInput;
