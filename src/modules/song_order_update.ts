import { Effect } from 'effect';

import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';

const songOrderUpdate: ModuleEffect<ModuleInput> = (query, request) =>
  Effect.gen(function* () {
    const data = {
      pid: query.pid,
      trackIds: query.ids,
      op: 'update',
    };

    return toModuleResponse(
      yield* request(
        buildApiRequestIntent(
          `/api/playlist/manipulate/tracks`,
          data,
          createOption(query),
        ),
      ),
    );
  });

/**
 * 更新歌曲顺序
 */
export default songOrderUpdate;

export { decodeLegacyModuleInput as decodeModuleInput } from './_input.ts';

export type ModuleInput = LegacyModuleInput;
