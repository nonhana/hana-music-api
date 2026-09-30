import { Effect } from 'effect';

import { InvalidModuleInput } from '../core/errors.ts';
import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';

const userCloudDetail: ModuleEffect<ModuleInput> = (query, request) =>
  Effect.gen(function* () {
    if (typeof query.id !== 'string') {
      return yield* Effect.fail(
        new InvalidModuleInput({ message: 'id must be a string' }),
      );
    }
    const id = query.id.replace(/\s/g, '').split(',');
    const data = {
      songIds: id,
    };
    return toModuleResponse(
      yield* request(
        buildApiRequestIntent(
          `/api/v1/cloud/get/byids`,
          data,
          createOption(query, 'weapi'),
        ),
      ),
    );
  });

/**
 * 云盘数据详情
 */
export default userCloudDetail;

export { decodeLegacyModuleInput as decodeModuleInput } from './_input.ts';

export type ModuleInput = LegacyModuleInput;
