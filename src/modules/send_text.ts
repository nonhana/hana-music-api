import { Effect } from 'effect';

import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';

const sendText: ModuleEffect<ModuleInput> = (query, request) =>
  Effect.gen(function* () {
    const data = {
      type: 'text',
      msg: query.msg,
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
 * 私信
 */
export default sendText;

export { decodeLegacyModuleInput as decodeModuleInput } from '../core/module-input.ts';

export type ModuleInput = LegacyModuleInput;
