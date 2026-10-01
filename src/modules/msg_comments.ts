import { Effect } from 'effect';

import { InvalidModuleInput } from '../core/errors.ts';
import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';

const msgComments: ModuleEffect<ModuleInput> = (query, request) =>
  Effect.gen(function* () {
    if (
      query.uid !== undefined &&
      query.uid !== null &&
      typeof query.uid !== 'string' &&
      typeof query.uid !== 'number' &&
      typeof query.uid !== 'boolean'
    ) {
      return yield* new InvalidModuleInput({
        message: 'uid must be a primitive value',
      });
    }
    const data = {
      beforeTime: query.before || '-1',
      limit: query.limit || 30,
      total: 'true',
      uid: query.uid,
    };

    return toModuleResponse(
      yield* request(
        buildApiRequestIntent(
          `/api/v1/user/comments/${String(query.uid)}`,
          data,
          createOption(query, 'weapi'),
        ),
      ),
    );
  });

/**
 * 评论
 */
export default msgComments;

export { decodeLegacyModuleInput as decodeModuleInput } from '../core/module-input.ts';

export type ModuleInput = LegacyModuleInput;
