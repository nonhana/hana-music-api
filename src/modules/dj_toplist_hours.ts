import { Effect } from 'effect';

import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';

const djToplistHours: ModuleEffect<ModuleInput> = (query, request) =>
  Effect.gen(function* () {
    const data = {
      limit: query.limit || 100,
      // 不支持 offset
    };
    return toModuleResponse(
      yield* request(
        buildApiRequestIntent(
          `/api/dj/toplist/hours`,
          data,
          createOption(query, 'weapi'),
        ),
      ),
    );
  });

/**
 * 电台24小时主播榜
 */
export default djToplistHours;

export { decodeLegacyModuleInput as decodeModuleInput } from './_input.ts';

export type ModuleInput = LegacyModuleInput;
