import { Effect } from 'effect';

import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';

const digitalAlbumSales: ModuleEffect<ModuleInput> = (query, request) =>
  Effect.gen(function* () {
    const data = {
      albumIds: query.ids,
    };
    return toModuleResponse(
      yield* request(
        buildApiRequestIntent(
          `/api/vipmall/albumproduct/album/query/sales`,
          data,
          createOption(query, 'weapi'),
        ),
      ),
    );
  });

/**
 * 数字专辑销量
 */
export default digitalAlbumSales;

export { decodeLegacyModuleInput as decodeModuleInput } from './_input.ts';

export type ModuleInput = LegacyModuleInput;
