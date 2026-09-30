import { Effect } from 'effect';

import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';

const userCloud: ModuleEffect<ModuleInput> = (query, request) =>
  Effect.gen(function* () {
    const data = {
      limit: query.limit || 30,
      offset: query.offset || 0,
    };
    return toModuleResponse(
      yield* request(
        buildApiRequestIntent(
          `/api/v1/cloud/get`,
          data,
          createOption(query, 'weapi'),
        ),
      ),
    );
  });

/**
 * 云盘数据
 */
export default userCloud;

export { decodeLegacyModuleInput as decodeModuleInput } from './_input.ts';

export type ModuleInput = LegacyModuleInput;
