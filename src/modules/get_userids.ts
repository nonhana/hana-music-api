import { Effect } from 'effect';

import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';

const getUserids: ModuleEffect<ModuleInput> = (query, request) =>
  Effect.gen(function* () {
    const data = {
      nicknames: query.nicknames,
    };
    return toModuleResponse(
      yield* request(
        buildApiRequestIntent(
          `/api/user/getUserIds`,
          data,
          createOption(query, 'weapi'),
        ),
      ),
    );
  });

export default getUserids;

export { decodeLegacyModuleInput as decodeModuleInput } from './_input.ts';

export type ModuleInput = LegacyModuleInput;
