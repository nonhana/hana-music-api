import { Effect } from 'effect';

import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';

const personalizedPrivatecontent: ModuleEffect<ModuleInput> = (
  query,
  request,
) =>
  Effect.gen(function* () {
    return toModuleResponse(
      yield* request(
        buildApiRequestIntent(
          `/api/personalized/privatecontent`,
          {},
          createOption(query, 'weapi'),
        ),
      ),
    );
  });

/**
 * 独家放送
 */
export default personalizedPrivatecontent;

export { decodeLegacyModuleInput as decodeModuleInput } from '../core/module-input.ts';

export type ModuleInput = LegacyModuleInput;
