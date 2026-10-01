import { Effect } from 'effect';

import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';

const msgNotices: ModuleEffect<ModuleInput> = (query, request) =>
  Effect.gen(function* () {
    const data = {
      limit: query.limit || 30,
      time: query.lasttime || -1,
    };
    return toModuleResponse(
      yield* request(
        buildApiRequestIntent(
          `/api/msg/notices`,
          data,
          createOption(query, 'weapi'),
        ),
      ),
    );
  });

/**
 * 通知
 */
export default msgNotices;

export { decodeLegacyModuleInput as decodeModuleInput } from '../core/module-input.ts';

export type ModuleInput = LegacyModuleInput;
