import { Effect } from 'effect';

import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';

const djSub: ModuleEffect<ModuleInput> = (input, request) =>
  Effect.gen(function* () {
    const query = { ...input };
    const action = Number(query.t) === 1 ? 'sub' : 'unsub';
    const data = {
      id: query.rid,
    };
    return toModuleResponse(
      yield* request(
        buildApiRequestIntent(
          `/api/djradio/${action}`,
          data,
          createOption(query, 'weapi'),
        ),
      ),
    );
  });

/**
 * 订阅与取消电台
 */
export default djSub;

export { decodeLegacyModuleInput as decodeModuleInput } from './_input.ts';

export type ModuleInput = LegacyModuleInput;
