import { Effect } from 'effect';

import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';

const ugcArtistSearch: ModuleEffect<ModuleInput> = (query, request) =>
  Effect.gen(function* () {
    const data = {
      keyword: query.keyword,
      limit: query.limit || 40,
    };
    return toModuleResponse(
      yield* request(
        buildApiRequestIntent(
          `/api/rep/ugc/artist/search`,
          data,
          createOption(query),
        ),
      ),
    );
  });

/**
 * 搜索歌手
 * 可传关键字或者歌手id
 */
export default ugcArtistSearch;

export { decodeLegacyModuleInput as decodeModuleInput } from '../core/module-input.ts';

export type ModuleInput = LegacyModuleInput;
