import { Effect } from 'effect';

import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';

const styleSong: ModuleEffect<ModuleInput> = (query, request) =>
  Effect.gen(function* () {
    const data = {
      cursor: query.cursor || 0,
      size: query.size || 20,
      tagId: query.tagId,
      sort: query.sort || 0,
    };
    return toModuleResponse(
      yield* request(
        buildApiRequestIntent(
          `/api/style-tag/home/song`,
          data,
          createOption(query, 'weapi'),
        ),
      ),
    );
  });

/**
 * 曲风-歌曲
 */
export default styleSong;

export { decodeLegacyModuleInput as decodeModuleInput } from './_input.ts';

export type ModuleInput = LegacyModuleInput;
