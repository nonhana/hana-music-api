import { Effect } from 'effect';

import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';

const vipGrowthpointGet: ModuleEffect<ModuleInput> = (query, request) =>
  Effect.gen(function* () {
    const data = {
      taskIds: query.ids,
    };
    return toModuleResponse(
      yield* request(
        buildApiRequestIntent(
          `/api/vipnewcenter/app/level/task/reward/get`,
          data,
          createOption(query, 'weapi'),
        ),
      ),
    );
  });

/**
 * 领取会员成长值
 */
export default vipGrowthpointGet;

export { decodeLegacyModuleInput as decodeModuleInput } from './_input.ts';

export type ModuleInput = LegacyModuleInput;
