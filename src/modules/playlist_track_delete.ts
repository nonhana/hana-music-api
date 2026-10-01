import { Effect } from 'effect';

import { InvalidModuleInput } from '../core/errors.ts';
import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';

const playlistTrackDelete: ModuleEffect<ModuleInput> = (query, request) =>
  Effect.gen(function* () {
    if (
      query.ids !== undefined &&
      query.ids !== null &&
      typeof query.ids !== 'string' &&
      typeof query.ids !== 'number' &&
      typeof query.ids !== 'boolean'
    ) {
      return yield* new InvalidModuleInput({
        message: 'ids must be a primitive value',
      });
    }
    const ids = String(query.ids ?? '');
    const data = {
      id: query.id,
      tracks: JSON.stringify(
        ids.split(',').map((item: string) => ({ type: 3, id: item })),
      ),
    };

    return toModuleResponse(
      yield* request(
        buildApiRequestIntent(
          `/api/playlist/track/delete`,
          data,
          createOption(query, 'weapi'),
        ),
      ),
    );
  });

/**
 * 收藏单曲到歌单 从歌单删除歌曲
 */
export default playlistTrackDelete;

export { decodeLegacyModuleInput as decodeModuleInput } from '../core/module-input.ts';

export type ModuleInput = LegacyModuleInput;
