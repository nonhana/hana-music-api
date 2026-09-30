import { Effect } from 'effect';

import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';

const activateInitProfile: ModuleEffect<ModuleInput> = (query, request) =>
  Effect.gen(function* () {
    const data = {
      nickname: query.nickname,
    };
    return toModuleResponse(
      yield* request(
        buildApiRequestIntent(
          `/api/activate/initProfile`,
          data,
          createOption(query),
        ),
      ),
    );
  });

/**
 * 初始化名字
 */
export default activateInitProfile;

export { decodeLegacyModuleInput as decodeModuleInput } from './_input.ts';

export type ModuleInput = LegacyModuleInput;
