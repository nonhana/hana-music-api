import { Effect } from 'effect';

import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';

const listentogetherAccept: ModuleEffect<ModuleInput> = (query, request) =>
  Effect.gen(function* () {
    const data = {
      refer: 'inbox_invite',
      roomId: query.roomId,
      inviterId: query.inviterId,
    };
    return toModuleResponse(
      yield* request(
        buildApiRequestIntent(
          `/api/listen/together/play/invitation/accept`,
          data,
          createOption(query),
        ),
      ),
    );
  });

export default listentogetherAccept;

export { decodeLegacyModuleInput as decodeModuleInput } from './_input.ts';

export type ModuleInput = LegacyModuleInput;
