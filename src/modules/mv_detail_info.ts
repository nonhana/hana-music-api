import { Effect } from 'effect';

import { InvalidModuleInput } from '../core/errors.ts';
import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';

const mvDetailInfo: ModuleEffect<ModuleInput> = (query, request) =>
  Effect.gen(function* () {
    if (
      query.mvid !== undefined &&
      query.mvid !== null &&
      typeof query.mvid !== 'string' &&
      typeof query.mvid !== 'number' &&
      typeof query.mvid !== 'boolean'
    ) {
      return yield* new InvalidModuleInput({
        message: 'mvid must be a primitive value',
      });
    }
    const data = {
      threadid: `R_MV_5_${String(query.mvid)}`,
      composeliked: true,
    };
    return toModuleResponse(
      yield* request(
        buildApiRequestIntent(
          `/api/comment/commentthread/info`,
          data,
          createOption(query, 'weapi'),
        ),
      ),
    );
  });

/**
 * MV 点赞转发评论数数据
 */
export default mvDetailInfo;

export { decodeLegacyModuleInput as decodeModuleInput } from '../core/module-input.ts';

export type ModuleInput = LegacyModuleInput;
