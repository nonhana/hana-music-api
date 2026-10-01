import { Effect } from 'effect';

import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';

const listenDataReport: ModuleEffect<ModuleInput> = (query, request) =>
  Effect.gen(function* () {
    return toModuleResponse(
      yield* request(
        buildApiRequestIntent(
          `/api/content/activity/listen/data/report`,
          {
            type: query.type || 'week', //周 week 月 month 年 year
            endTime: query.endTime, // 不填就是本周/月的
          },
          createOption(query),
        ),
      ),
    );
  });

/**
 * 听歌足迹 - 周/月/年收听报告
 */
export default listenDataReport;

export { decodeLegacyModuleInput as decodeModuleInput } from '../core/module-input.ts';

export type ModuleInput = LegacyModuleInput;
