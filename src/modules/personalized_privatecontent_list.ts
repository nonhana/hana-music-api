import { Effect } from 'effect';

import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';

const personalizedPrivatecontentList: ModuleEffect<ModuleInput> = (
  query,
  request,
) =>
  Effect.gen(function* () {
    const data = {
      offset: query.offset || 0,
      total: 'true',
      limit: query.limit || 60,
    };
    return toModuleResponse(
      yield* request(
        buildApiRequestIntent(
          `/api/v2/privatecontent/list`,
          data,
          createOption(query, 'weapi'),
        ),
      ),
    );
  });

/**
 * 独家放送列表
 */
export default personalizedPrivatecontentList;

export { decodeLegacyModuleInput as decodeModuleInput } from '../core/module-input.ts';

export type ModuleInput = LegacyModuleInput;
