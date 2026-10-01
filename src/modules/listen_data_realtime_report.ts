import { Effect } from 'effect';

import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';

const listenDataRealtimeReport: ModuleEffect<ModuleInput> = (query, request) =>
  Effect.gen(function* () {
    return toModuleResponse(
      yield* request(
        buildApiRequestIntent(
          `/api/content/activity/listen/data/realtime/report`,
          {
            type: query.type || 'week', //周 week 月 month
          },
          createOption(query),
        ),
      ),
    );
  });

/**
 * 听歌足迹 - 本周/本月收听时长
 */
export default listenDataRealtimeReport;

export { decodeLegacyModuleInput as decodeModuleInput } from '../core/module-input.ts';

export type ModuleInput = LegacyModuleInput;
