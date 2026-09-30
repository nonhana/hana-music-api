import { Effect } from 'effect';

import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';

const broadcastChannelCollectList: ModuleEffect<ModuleInput> = (
  query,
  request,
) =>
  Effect.gen(function* () {
    const data = {
      contentType: 'BROADCAST',
      limit: query.limit || '99999',
      timeReverseOrder: 'true',
      startDate: '4762584922000',
    };
    return toModuleResponse(
      yield* request(
        buildApiRequestIntent(
          `/api/content/channel/collect/list`,
          data,
          createOption(query),
        ),
      ),
    );
  });

/**
 * 广播电台 - 我的收藏
 */
export default broadcastChannelCollectList;

export { decodeLegacyModuleInput as decodeModuleInput } from './_input.ts';

export type ModuleInput = LegacyModuleInput;
