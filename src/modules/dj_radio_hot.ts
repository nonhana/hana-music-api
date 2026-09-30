import { Effect } from 'effect';

import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';

const djRadioHot: ModuleEffect<ModuleInput> = (query, request) =>
  Effect.gen(function* () {
    const data = {
      cateId: query.cateId,
      limit: query.limit || 30,
      offset: query.offset || 0,
    };
    return toModuleResponse(
      yield* request(
        buildApiRequestIntent(
          `/api/djradio/hot`,
          data,
          createOption(query, 'weapi'),
        ),
      ),
    );
  });

/**
 * 类别热门电台
 */
export default djRadioHot;

export { decodeLegacyModuleInput as decodeModuleInput } from './_input.ts';

export type ModuleInput = LegacyModuleInput;
