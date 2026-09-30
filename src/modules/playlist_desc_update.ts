import { Effect } from 'effect';

import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';

const playlistDescUpdate: ModuleEffect<ModuleInput> = (query, request) =>
  Effect.gen(function* () {
    const data = {
      id: query.id,
      desc: query.desc,
    };
    return toModuleResponse(
      yield* request(
        buildApiRequestIntent(
          `/api/playlist/desc/update`,
          data,
          createOption(query),
        ),
      ),
    );
  });

/**
 * 更新歌单描述
 */
export default playlistDescUpdate;

export { decodeLegacyModuleInput as decodeModuleInput } from './_input.ts';

export type ModuleInput = LegacyModuleInput;
