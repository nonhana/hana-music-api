import { Effect } from 'effect';

import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';

const personalFm: ModuleEffect<ModuleInput> = (query, request) =>
  Effect.gen(function* () {
    return toModuleResponse(
      yield* request(
        buildApiRequestIntent(
          `/api/v1/radio/get`,
          {},
          createOption(query, 'weapi'),
        ),
      ),
    );
  });

/**
 * 私人FM
 */
export default personalFm;

export { decodeLegacyModuleInput as decodeModuleInput } from './_input.ts';

export type ModuleInput = LegacyModuleInput;
