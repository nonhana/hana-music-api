import { Effect } from 'effect';

import { InvalidModuleInput } from '../core/errors.ts';
import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';

const listentogetherSyncListCommand: ModuleEffect<ModuleInput> = (
  query,
  request,
) =>
  Effect.gen(function* () {
    if (
      typeof query.randomList !== 'string' ||
      typeof query.displayList !== 'string'
    ) {
      return yield* new InvalidModuleInput({
        message: 'randomList and displayList must be strings',
      });
    }
    const data = {
      roomId: query.roomId,
      playlistParam: JSON.stringify({
        commandType: query.commandType,
        version: [
          {
            userId: query.userId,
            version: query.version,
          },
        ],
        anchorSongId: '',
        anchorPosition: -1,
        randomList: query.randomList.split(','),
        displayList: query.displayList.split(','),
      }),
    };
    return toModuleResponse(
      yield* request(
        buildApiRequestIntent(
          `/api/listen/together/sync/list/command/report`,
          data,
          createOption(query),
        ),
      ),
    );
  });

/**
 * 一起听 更新播放列表
 */
export default listentogetherSyncListCommand;

export { decodeLegacyModuleInput as decodeModuleInput } from './_input.ts';

export type ModuleInput = LegacyModuleInput;
