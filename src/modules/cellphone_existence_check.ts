import { Effect } from 'effect';

import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';

const cellphoneExistenceCheck: ModuleEffect<ModuleInput> = (query, request) =>
  Effect.gen(function* () {
    const data = {
      cellphone: query.phone,
      countrycode: query.countrycode,
    };
    return toModuleResponse(
      yield* request(
        buildApiRequestIntent(
          `/api/cellphone/existence/check`,
          data,
          createOption(query),
        ),
      ),
    );
  });

/**
 * 检测手机号码是否已注册
 */
export default cellphoneExistenceCheck;

export { decodeLegacyModuleInput as decodeModuleInput } from './_input.ts';

export type ModuleInput = LegacyModuleInput;
