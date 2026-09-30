import { Effect } from 'effect';

import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';

const mvSub: ModuleEffect<ModuleInput> = (input, request) =>
  Effect.gen(function* () {
    const query = { ...input };
    const action = Number(query.t) === 1 ? 'sub' : 'unsub';
    const data = {
      mvId: query.mvid,
      mvIds: '["' + query.mvid + '"]',
    };
    return toModuleResponse(
      yield* request(
        buildApiRequestIntent(
          `/api/mv/${action}`,
          data,
          createOption(query, 'weapi'),
        ),
      ),
    );
  });

/**
 * 收藏与取消收藏MV
 */
export default mvSub;

export { decodeLegacyModuleInput as decodeModuleInput } from './_input.ts';

export type ModuleInput = LegacyModuleInput;
