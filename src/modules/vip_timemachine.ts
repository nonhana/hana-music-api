import { Effect } from 'effect';

import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';

const vipTimemachine: ModuleEffect<ModuleInput> = (query, request) =>
  Effect.gen(function* () {
    const data: Record<string, unknown> = {};
    if (query.startTime && query.endTime) {
      data.startTime = query.startTime;
      data.endTime = query.endTime;
      data.type = 1;
      data.limit = query.limit || 60;
    }
    return toModuleResponse(
      yield* request(
        buildApiRequestIntent(
          `/api/vipmusic/newrecord/weekflow`,
          data,
          createOption(query, 'weapi'),
        ),
      ),
    );
  });

/**
 * 黑胶时光机
 */
export default vipTimemachine;

export { decodeLegacyModuleInput as decodeModuleInput } from './_input.ts';

export type ModuleInput = LegacyModuleInput;
