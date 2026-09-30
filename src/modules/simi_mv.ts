import { Effect } from 'effect';

import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';

const simiMv: ModuleEffect<ModuleInput> = (query, request) =>
  Effect.gen(function* () {
    const data = {
      mvid: query.mvid,
    };
    return toModuleResponse(
      yield* request(
        buildApiRequestIntent(
          `/api/discovery/simiMV`,
          data,
          createOption(query, 'weapi'),
        ),
      ),
    );
  });

/**
 * 相似MV
 */
export default simiMv;

export { decodeLegacyModuleInput as decodeModuleInput } from './_input.ts';

export type ModuleInput = LegacyModuleInput;
