import { Effect } from 'effect';

import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';

const cloudMatch: ModuleEffect<ModuleInput> = (query, request) =>
  Effect.gen(function* () {
    const data = {
      userId: query.uid,
      songId: query.sid,
      adjustSongId: query.asid,
    };
    return toModuleResponse(
      yield* request(
        buildApiRequestIntent(
          `/api/cloud/user/song/match`,
          data,
          createOption(query, 'weapi'),
        ),
      ),
    );
  });

export default cloudMatch;

export { decodeLegacyModuleInput as decodeModuleInput } from './_input.ts';

export type ModuleInput = LegacyModuleInput;
