import { Effect } from 'effect';

import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';
import { resolveDjToplistType } from './dj_toplist/type.ts';

const djToplist: ModuleEffect<ModuleInput> = (query, request) =>
  Effect.gen(function* () {
    const data = {
      limit: query.limit || 100,
      offset: query.offset || 0,
      type: resolveDjToplistType(query.type), //0为新晋,1为热门
    };
    return toModuleResponse(
      yield* request(
        buildApiRequestIntent(
          `/api/djradio/toplist`,
          data,
          createOption(query, 'weapi'),
        ),
      ),
    );
  });

/**
 * 新晋电台榜/热门电台榜
 */
export default djToplist;

export { decodeLegacyModuleInput as decodeModuleInput } from './_input.ts';

export type ModuleInput = LegacyModuleInput;
