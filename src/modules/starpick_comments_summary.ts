import { Effect } from 'effect';

import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';

const starpickCommentsSummary: ModuleEffect<ModuleInput> = (query, request) =>
  Effect.gen(function* () {
    const data = {
      cursor: JSON.stringify({
        offset: 0,
        blockCodeOrderList: ['HOMEPAGE_BLOCK_NEW_HOT_COMMENT'],
        refresh: true,
      }),
    };
    return toModuleResponse(
      yield* request(
        buildApiRequestIntent(
          `/api/homepage/block/page`,
          data,
          createOption(query),
        ),
      ),
    );
  });

/**
 * 云村星评馆 - 简要评论列表
 */
export default starpickCommentsSummary;

export { decodeLegacyModuleInput as decodeModuleInput } from './_input.ts';

export type ModuleInput = LegacyModuleInput;
