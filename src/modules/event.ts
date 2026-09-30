import { Effect } from 'effect';

import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';

const event: ModuleEffect<ModuleInput> = (query, request) =>
  Effect.gen(function* () {
    const data = {
      pagesize: query.pagesize || 20,
      lasttime: query.lasttime || -1,
    };
    return toModuleResponse(
      yield* request(
        buildApiRequestIntent(
          `/api/v1/event/get`,
          data,
          createOption(query, 'weapi'),
        ),
      ),
    );
  });

/**
 * 获取动态列表
 */
export default event;

export { decodeLegacyModuleInput as decodeModuleInput } from './_input.ts';

export type ModuleInput = LegacyModuleInput;
