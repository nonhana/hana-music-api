import { Effect } from 'effect';

import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';

const yunbeiRcmdSong: ModuleEffect<ModuleInput> = (query, request) =>
  Effect.gen(function* () {
    const data = {
      songId: query.id,
      reason: query.reason || '好歌献给你',
      scene: '',
      fromUserId: -1,
      yunbeiNum: query.yunbeiNum || 10,
    };
    return toModuleResponse(
      yield* request(
        buildApiRequestIntent(
          `/api/yunbei/rcmd/song/submit`,
          data,
          createOption(query, 'weapi'),
        ),
      ),
    );
  });

/**
 * 云贝推歌
 */
export default yunbeiRcmdSong;

export { decodeLegacyModuleInput as decodeModuleInput } from '../core/module-input.ts';

export type ModuleInput = LegacyModuleInput;
