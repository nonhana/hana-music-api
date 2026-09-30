import { Effect } from 'effect';

import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';

const listentogetherRoomCreate: ModuleEffect<ModuleInput> = (query, request) =>
  Effect.gen(function* () {
    const data = {
      refer: 'songplay_more',
    };
    return toModuleResponse(
      yield* request(
        buildApiRequestIntent(
          `/api/listen/together/room/create`,
          data,
          createOption(query),
        ),
      ),
    );
  });

/**
 * 一起听创建房间
 */
export default listentogetherRoomCreate;

export { decodeLegacyModuleInput as decodeModuleInput } from './_input.ts';

export type ModuleInput = LegacyModuleInput;
