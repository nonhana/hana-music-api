import { Effect } from 'effect';

import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';

const topList: ModuleEffect<ModuleInput> = (query, request) =>
  Effect.gen(function* () {
    if (query.idx) {
      return {
        status: 500,
        cookie: [],
        body: { code: 500, msg: '不支持此方式调用,只支持id调用' },
      };
    }
    return toModuleResponse(
      yield* request(
        buildApiRequestIntent(
          '/api/playlist/v4/detail',
          { id: query.id, n: '500', s: '0' },
          createOption(query),
        ),
      ),
    );
  });

export default topList;
export { decodeLegacyModuleInput as decodeModuleInput } from '../core/module-input.ts';

export type ModuleInput = LegacyModuleInput;
