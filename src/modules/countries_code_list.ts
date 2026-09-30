import { Effect } from 'effect';

import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';

const countriesCodeList: ModuleEffect<ModuleInput> = (query, request) =>
  Effect.gen(function* () {
    const data = {};
    return toModuleResponse(
      yield* request(
        buildApiRequestIntent(
          `/api/lbs/countries/v1`,
          data,
          createOption(query),
        ),
      ),
    );
  });

/**
 * 国家编码列表
 */
export default countriesCodeList;

export { decodeLegacyModuleInput as decodeModuleInput } from './_input.ts';

export type ModuleInput = LegacyModuleInput;
