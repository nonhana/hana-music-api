import { Effect } from 'effect';

import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';

const artistNewSong: ModuleEffect<ModuleInput> = (query, request) =>
  Effect.gen(function* () {
    const data = {
      limit: query.limit || 20,
      startTimestamp: query.before || Date.now(),
    };
    return toModuleResponse(
      yield* request(
        buildApiRequestIntent(
          `/api/sub/artist/new/works/song/list`,
          data,
          createOption(query, 'weapi'),
        ),
      ),
    );
  });

export default artistNewSong;

export { decodeLegacyModuleInput as decodeModuleInput } from './_input.ts';

export type ModuleInput = LegacyModuleInput;
