import { Effect } from 'effect';

import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';

const djSubscriber: ModuleEffect<ModuleInput> = (query, request) =>
  Effect.gen(function* () {
    const data = {
      time: query.time || '-1',
      id: query.id,
      limit: query.limit || '20',
      total: 'true',
    };
    return toModuleResponse(
      yield* request(
        buildApiRequestIntent(
          `/api/djradio/subscriber`,
          data,
          createOption(query, 'weapi'),
        ),
      ),
    );
  });

/**
 * 电台详情
 */
export default djSubscriber;

export { decodeLegacyModuleInput as decodeModuleInput } from './_input.ts';

export type ModuleInput = LegacyModuleInput;
