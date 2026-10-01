import { Effect } from 'effect';

import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';

const mvAll: ModuleEffect<ModuleInput> = (query, request) =>
  Effect.gen(function* () {
    const data = {
      tags: JSON.stringify({
        地区: query.area || '全部',
        类型: query.type || '全部',
        排序: query.order || '上升最快',
      }),
      offset: query.offset || 0,
      total: 'true',
      limit: query.limit || 30,
    };
    return toModuleResponse(
      yield* request(
        buildApiRequestIntent(`/api/mv/all`, data, createOption(query)),
      ),
    );
  });

/**
 * 全部MV
 */
export default mvAll;

export { decodeLegacyModuleInput as decodeModuleInput } from '../core/module-input.ts';

export type ModuleInput = LegacyModuleInput;
