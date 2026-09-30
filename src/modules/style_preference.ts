import { Effect } from 'effect';

import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';

const stylePreference: ModuleEffect<ModuleInput> = (query, request) =>
  Effect.gen(function* () {
    const data = {};
    return toModuleResponse(
      yield* request(
        buildApiRequestIntent(
          `/api/tag/my/preference/get`,
          data,
          createOption(query, 'weapi'),
        ),
      ),
    );
  });

/**
 * 曲风偏好
 */
export default stylePreference;

export { decodeLegacyModuleInput as decodeModuleInput } from './_input.ts';

export type ModuleInput = LegacyModuleInput;
