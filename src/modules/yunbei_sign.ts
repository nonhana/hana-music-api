import { Effect } from 'effect';

import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';

const yunbeiSign: ModuleEffect<ModuleInput> = (query, request) =>
  Effect.gen(function* () {
    const data = {};
    return toModuleResponse(
      yield* request(
        buildApiRequestIntent(
          `/api/pointmall/user/sign`,
          data,
          createOption(query, 'weapi'),
        ),
      ),
    );
  });

export default yunbeiSign;

export { decodeLegacyModuleInput as decodeModuleInput } from './_input.ts';

export type ModuleInput = LegacyModuleInput;
