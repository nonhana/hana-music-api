import { Effect } from 'effect';

import { InvalidModuleInput } from '../core/errors.ts';
import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';

const like: ModuleEffect<ModuleInput> = (input, request) =>
  Effect.gen(function* () {
    const query = { ...input };
    if (
      query.like !== undefined &&
      query.like !== null &&
      typeof query.like !== 'string' &&
      typeof query.like !== 'number' &&
      typeof query.like !== 'boolean'
    ) {
      return yield* new InvalidModuleInput({
        message: 'like must be a primitive value',
      });
    }
    query.like = String(query.like ?? '') !== 'false';
    const data = {
      alg: 'itembased',
      trackId: query.id,
      like: query.like,
      time: '3',
    };
    return toModuleResponse(
      yield* request(
        buildApiRequestIntent(
          `/api/radio/like`,
          data,
          createOption(query, 'weapi'),
        ),
      ),
    );
  });

/**
 * 红心与取消红心歌曲
 */
export default like;

export { decodeLegacyModuleInput as decodeModuleInput } from './_input.ts';

export type ModuleInput = LegacyModuleInput;
