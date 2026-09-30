import { Effect } from 'effect';

import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';

const songSingledownlist: ModuleEffect<ModuleInput> = (query, request) =>
  Effect.gen(function* () {
    const data = {
      limit: query.limit || '20',
      offset: query.offset || '0',
      total: 'true',
    };
    return toModuleResponse(
      yield* request(
        buildApiRequestIntent(
          `/api/member/song/singledownlist`,
          data,
          createOption(query),
        ),
      ),
    );
  });

/**
 * 已购买单曲
 */
export default songSingledownlist;

export { decodeLegacyModuleInput as decodeModuleInput } from './_input.ts';

export type ModuleInput = LegacyModuleInput;
