import { Effect } from 'effect';

import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';

const userSocialStatusEdit: ModuleEffect<ModuleInput> = (query, request) =>
  Effect.gen(function* () {
    return toModuleResponse(
      yield* request(
        buildApiRequestIntent(
          `/api/social/user/status/edit`,
          {
            content: JSON.stringify({
              type: query.type,
              iconUrl: query.iconUrl,
              content: query.content,
              actionUrl: query.actionUrl,
            }),
          },
          createOption(query),
        ),
      ),
    );
  });

/**
 * 用户状态 - 编辑
 */
export default userSocialStatusEdit;

export { decodeLegacyModuleInput as decodeModuleInput } from '../core/module-input.ts';

export type ModuleInput = LegacyModuleInput;
