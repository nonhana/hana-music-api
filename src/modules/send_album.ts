import { Effect } from 'effect';

import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';

const sendAlbum: ModuleEffect<ModuleInput> = (query, request) =>
  Effect.gen(function* () {
    const data = {
      id: query.id,
      msg: query.msg || '',
      type: 'album',
      userIds: '[' + query.user_ids + ']',
    };
    return toModuleResponse(
      yield* request(
        buildApiRequestIntent(
          `/api/msg/private/send`,
          data,
          createOption(query),
        ),
      ),
    );
  });

/**
 * 私信专辑
 */
export default sendAlbum;

export { decodeLegacyModuleInput as decodeModuleInput } from '../core/module-input.ts';

export type ModuleInput = LegacyModuleInput;
