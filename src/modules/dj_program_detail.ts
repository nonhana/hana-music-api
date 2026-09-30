import { Effect } from 'effect';

import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';

const djProgramDetail: ModuleEffect<ModuleInput> = (query, request) =>
  Effect.gen(function* () {
    const data = {
      id: query.id,
    };
    return toModuleResponse(
      yield* request(
        buildApiRequestIntent(
          `/api/dj/program/detail`,
          data,
          createOption(query, 'weapi'),
        ),
      ),
    );
  });

/**
 * 电台节目详情
 */
export default djProgramDetail;

export { decodeLegacyModuleInput as decodeModuleInput } from './_input.ts';

export type ModuleInput = LegacyModuleInput;
