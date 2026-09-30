import { Effect } from 'effect';

import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';

const topSong: ModuleEffect<ModuleInput> = (query, request) =>
  Effect.gen(function* () {
    const data = {
      areaId: query.type || 0, // 全部:0 华语:7 欧美:96 日本:8 韩国:16
      // limit: query.limit || 100,
      // offset: query.offset || 0,
      total: true,
    };
    return toModuleResponse(
      yield* request(
        buildApiRequestIntent(
          `/api/v1/discovery/new/songs`,
          data,
          createOption(query, 'weapi'),
        ),
      ),
    );
  });

/**
 * 新歌速递
 */
export default topSong;

export { decodeLegacyModuleInput as decodeModuleInput } from './_input.ts';

export type ModuleInput = LegacyModuleInput;
