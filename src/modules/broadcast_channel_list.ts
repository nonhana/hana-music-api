import { Effect } from 'effect';

import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';

const broadcastChannelList: ModuleEffect<ModuleInput> = (query, request) =>
  Effect.gen(function* () {
    const data = {
      categoryId: query.categoryId || '0',
      regionId: query.regionId || '0',
      limit: query.limit || '20',
      lastId: query.lastId || '0',
      score: query.score || '-1',
    };
    return toModuleResponse(
      yield* request(
        buildApiRequestIntent(
          `/api/voice/broadcast/channel/list`,
          data,
          createOption(query),
        ),
      ),
    );
  });

/**
 * 广播电台 - 全部电台
 */
export default broadcastChannelList;

export { decodeLegacyModuleInput as decodeModuleInput } from './_input.ts';

export type ModuleInput = LegacyModuleInput;
