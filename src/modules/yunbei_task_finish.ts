import { Effect } from 'effect';

import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';

const yunbeiTaskFinish: ModuleEffect<ModuleInput> = (query, request) =>
  Effect.gen(function* () {
    const data = {
      userTaskId: query.userTaskId,
      depositCode: query.depositCode || '0',
    };
    const response = yield* request(
      buildApiRequestIntent(
        `/api/usertool/task/point/receive`,
        data,
        createOption(query, 'weapi'),
      ),
    );
    return toModuleResponse(response);
  });

export default yunbeiTaskFinish;

export { decodeLegacyModuleInput as decodeModuleInput } from '../core/module-input.ts';

export type ModuleInput = LegacyModuleInput;
