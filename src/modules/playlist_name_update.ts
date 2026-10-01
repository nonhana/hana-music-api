import { Effect } from 'effect';

import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';

const playlistNameUpdate: ModuleEffect<ModuleInput> = (query, request) =>
  Effect.gen(function* () {
    const data = {
      id: query.id,
      name: query.name,
    };
    return toModuleResponse(
      yield* request(
        buildApiRequestIntent(
          `/api/playlist/update/name`,
          data,
          createOption(query),
        ),
      ),
    );
  });

/**
 * 更新歌单名
 */
export default playlistNameUpdate;

export { decodeLegacyModuleInput as decodeModuleInput } from '../core/module-input.ts';

export type ModuleInput = LegacyModuleInput;
