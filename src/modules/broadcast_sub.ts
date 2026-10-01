import { Effect } from 'effect';

import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';

const broadcastSub: ModuleEffect<ModuleInput> = (input, request) =>
  Effect.gen(function* () {
    const query = { ...input };
    query.t = Number(query.t) === 1 ? 'false' : 'true';
    const data = {
      contentType: 'BROADCAST',
      contentId: query.id,
      cancelCollect: query.t,
    };
    return toModuleResponse(
      yield* request(
        buildApiRequestIntent(
          `/api/content/interact/collect`,
          data,
          createOption(query),
        ),
      ),
    );
  });

/**
 * 广播电台 - 收藏/取消收藏电台
 */
export default broadcastSub;

export { decodeLegacyModuleInput as decodeModuleInput } from '../core/module-input.ts';

export type ModuleInput = LegacyModuleInput;
