import { Effect } from 'effect';

import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';

const signinProgress: ModuleEffect<ModuleInput> = (query, request) =>
  Effect.gen(function* () {
    const data = {
      moduleId: query.moduleId || '1207signin-1207signin',
    };
    return toModuleResponse(
      yield* request(
        buildApiRequestIntent(
          `/api/act/modules/signin/v2/progress`,
          data,
          createOption(query, 'weapi'),
        ),
      ),
    );
  });

/**
 * 签到进度
 */
export default signinProgress;

export { decodeLegacyModuleInput as decodeModuleInput } from './_input.ts';

export type ModuleInput = LegacyModuleInput;
