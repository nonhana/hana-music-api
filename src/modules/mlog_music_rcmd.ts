import { Effect } from 'effect';

import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';

const mlogMusicRcmd: ModuleEffect<ModuleInput> = (query, request) =>
  Effect.gen(function* () {
    const data = {
      id: query.mvid || 0,
      type: 2,
      rcmdType: 20,
      limit: query.limit || 10,
      extInfo: JSON.stringify({ songId: query.songid }),
    };
    return toModuleResponse(
      yield* request(
        buildApiRequestIntent(
          `/api/mlog/rcmd/feed/list`,
          data,
          createOption(query),
        ),
      ),
    );
  });

/**
 * 歌曲相关视频
 */
export default mlogMusicRcmd;

export { decodeLegacyModuleInput as decodeModuleInput } from './_input.ts';

export type ModuleInput = LegacyModuleInput;
