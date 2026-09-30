import { Effect } from 'effect';

import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';

const listentogetherPlayCommand: ModuleEffect<ModuleInput> = (query, request) =>
  Effect.gen(function* () {
    const data = {
      roomId: query.roomId,
      commandInfo: JSON.stringify({
        commandType: query.commandType,
        progress: query.progress || 0,
        playStatus: query.playStatus,
        formerSongId: query.formerSongId,
        targetSongId: query.targetSongId,
        clientSeq: query.clientSeq,
      }),
    };
    return toModuleResponse(
      yield* request(
        buildApiRequestIntent(
          `/api/listen/together/play/command/report`,
          data,
          createOption(query),
        ),
      ),
    );
  });

/**
 * 一起听 发送播放状态
 */
export default listentogetherPlayCommand;

export { decodeLegacyModuleInput as decodeModuleInput } from './_input.ts';

export type ModuleInput = LegacyModuleInput;
