import { Effect } from 'effect';

import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';

const playlistHighqualityTags: ModuleEffect<ModuleInput> = (query, request) =>
  Effect.gen(function* () {
    const data = {};
    return toModuleResponse(
      yield* request(
        buildApiRequestIntent(
          `/api/playlist/highquality/tags`,
          data,
          createOption(query, 'weapi'),
        ),
      ),
    );
  });

/**
 * 精品歌单 tags
 */
export default playlistHighqualityTags;

export { decodeLegacyModuleInput as decodeModuleInput } from './_input.ts';

export type ModuleInput = LegacyModuleInput;
