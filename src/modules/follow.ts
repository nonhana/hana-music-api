import { Effect } from 'effect';

import { InvalidModuleInput } from '../core/errors.ts';
import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';

const follow: ModuleEffect<ModuleInput> = (input, request) =>
  Effect.gen(function* () {
    const query = { ...input };
    if (
      query.id !== undefined &&
      query.id !== null &&
      typeof query.id !== 'string' &&
      typeof query.id !== 'number' &&
      typeof query.id !== 'boolean'
    ) {
      return yield* new InvalidModuleInput({
        message: 'id must be a primitive value',
      });
    }
    const action = Number(query.t) === 1 ? 'follow' : 'delfollow';
    return toModuleResponse(
      yield* request(
        buildApiRequestIntent(
          `/api/user/${action}/${String(query.id)}`,
          {},
          createOption(query, 'weapi'),
        ),
      ),
    );
  });

/**
 * 关注与取消关注用户
 */
export default follow;

export { decodeLegacyModuleInput as decodeModuleInput } from './_input.ts';

export type ModuleInput = LegacyModuleInput;
