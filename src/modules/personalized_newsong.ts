import { Effect } from 'effect';

import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';

const personalizedNewsong: ModuleEffect<ModuleInput> = (query, request) =>
  Effect.gen(function* () {
    const data = {
      type: 'recommend',
      limit: query.limit || 10,
      areaId: query.areaId || 0,
    };
    return toModuleResponse(
      yield* request(
        buildApiRequestIntent(
          `/api/personalized/newsong`,
          data,
          createOption(query, 'weapi'),
        ),
      ),
    );
  });

/**
 * 推荐新歌
 */
export default personalizedNewsong;

export { decodeLegacyModuleInput as decodeModuleInput } from './_input.ts';

export type ModuleInput = LegacyModuleInput;
