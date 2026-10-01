import { Effect } from 'effect';

import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';

const musicianCloudbeanObtain: ModuleEffect<ModuleInput> = (query, request) =>
  Effect.gen(function* () {
    const data = {
      userMissionId: query.id,
      period: query.period,
    };
    return toModuleResponse(
      yield* request(
        buildApiRequestIntent(
          `/api/nmusician/workbench/mission/reward/obtain/new`,
          data,
          createOption(query, 'weapi'),
        ),
      ),
    );
  });

/**
 * 领取云豆
 */
export default musicianCloudbeanObtain;

export { decodeLegacyModuleInput as decodeModuleInput } from '../core/module-input.ts';

export type ModuleInput = LegacyModuleInput;
