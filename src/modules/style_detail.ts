import { Effect } from 'effect';

import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';

const styleDetail: ModuleEffect<ModuleInput> = (query, request) =>
  Effect.gen(function* () {
    const data = {
      tagId: query.tagId,
    };
    return toModuleResponse(
      yield* request(
        buildApiRequestIntent(
          `/api/style-tag/home/head`,
          data,
          createOption(query, 'weapi'),
        ),
      ),
    );
  });

/**
 * 曲风详情
 */
export default styleDetail;

export { decodeLegacyModuleInput as decodeModuleInput } from '../core/module-input.ts';

export type ModuleInput = LegacyModuleInput;
