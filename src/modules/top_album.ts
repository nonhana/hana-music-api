import { Effect } from 'effect';

import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';

const topAlbum: ModuleEffect<ModuleInput> = (query, request) =>
  Effect.gen(function* () {
    const date = new Date();

    const data = {
      area: query.area || 'ALL', // //ALL:全部,ZH:华语,EA:欧美,KR:韩国,JP:日本
      limit: query.limit || 50,
      offset: query.offset || 0,
      type: query.type || 'new',
      year: query.year || date.getFullYear(),
      month: query.month || date.getMonth() + 1,
      total: false,
      rcmd: true,
    };
    return toModuleResponse(
      yield* request(
        buildApiRequestIntent(
          `/api/discovery/new/albums/area`,
          data,
          createOption(query, 'weapi'),
        ),
      ),
    );
  });

/**
 * 新碟上架
 */
export default topAlbum;

export { decodeLegacyModuleInput as decodeModuleInput } from '../core/module-input.ts';

export type ModuleInput = LegacyModuleInput;
