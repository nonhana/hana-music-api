import { Effect } from 'effect';

import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';

const listentogetherHeatbeat: ModuleEffect<ModuleInput> = (query, request) =>
  Effect.gen(function* () {
    const data = {
      roomId: query.roomId,
      songId: query.songId,
      playStatus: query.playStatus,
      progress: query.progress,
    };
    return toModuleResponse(
      yield* request(
        buildApiRequestIntent(
          `/api/listen/together/heartbeat`,
          data,
          createOption(query),
        ),
      ),
    );
  });

/**
 * 一起听 发送心跳
 */
export default listentogetherHeatbeat;

export { decodeLegacyModuleInput as decodeModuleInput } from './_input.ts';

export type ModuleInput = LegacyModuleInput;
