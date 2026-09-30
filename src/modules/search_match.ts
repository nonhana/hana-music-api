import { Effect } from 'effect';

import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';

const searchMatch: ModuleEffect<ModuleInput> = (query, request) =>
  Effect.gen(function* () {
    const songs = [
      {
        title: query.title || '',
        album: query.album || '',
        artist: query.artist || '',
        duration: query.duration || 0,
        persistId: query.md5,
      },
    ];
    const data = {
      songs: JSON.stringify(songs),
    };
    return toModuleResponse(
      yield* request(
        buildApiRequestIntent(
          `/api/search/match/new`,
          data,
          createOption(query),
        ),
      ),
    );
  });

/**
 * 本地歌曲匹配音乐信息
 */
export default searchMatch;

export { decodeLegacyModuleInput as decodeModuleInput } from './_input.ts';

export type ModuleInput = LegacyModuleInput;
