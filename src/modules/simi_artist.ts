import { Effect } from 'effect';

import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';

const simiArtist: ModuleEffect<ModuleInput> = (query, request) =>
  Effect.gen(function* () {
    const data = {
      artistid: query.id,
    };
    return toModuleResponse(
      yield* request(
        buildApiRequestIntent(
          `/api/discovery/simiArtist`,
          data,
          createOption(query, 'weapi'),
        ),
      ),
    );
  });

/**
 * 相似歌手
 */
export default simiArtist;

export { decodeLegacyModuleInput as decodeModuleInput } from './_input.ts';

export type ModuleInput = LegacyModuleInput;
