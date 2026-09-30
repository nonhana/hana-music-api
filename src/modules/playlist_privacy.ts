import { Effect } from 'effect';

import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';

const playlistPrivacy: ModuleEffect<ModuleInput> = (query, request) =>
  Effect.gen(function* () {
    const data = {
      id: query.id,
      privacy: 0,
    };
    return toModuleResponse(
      yield* request(
        buildApiRequestIntent(
          `/api/playlist/update/privacy`,
          data,
          createOption(query),
        ),
      ),
    );
  });

/**
 * 公开隐私歌单
 */
export default playlistPrivacy;

export { decodeLegacyModuleInput as decodeModuleInput } from './_input.ts';

export type ModuleInput = LegacyModuleInput;
