import { Effect } from 'effect';

import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';

const digitalAlbumPurchased: ModuleEffect<ModuleInput> = (query, request) =>
  Effect.gen(function* () {
    const data = {
      limit: query.limit || 30,
      offset: query.offset || 0,
      total: true,
    };
    return toModuleResponse(
      yield* request(
        buildApiRequestIntent(
          `/api/digitalAlbum/purchased`,
          data,
          createOption(query, 'weapi'),
        ),
      ),
    );
  });

/**
 * 我的数字专辑
 */
export default digitalAlbumPurchased;

export { decodeLegacyModuleInput as decodeModuleInput } from '../core/module-input.ts';

export type ModuleInput = LegacyModuleInput;
