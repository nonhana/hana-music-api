import { Effect } from 'effect';

import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';

const userPlaylistCollect: ModuleEffect<ModuleInput> = (query, request) =>
  Effect.gen(function* () {
    const data = {
      limit: query.limit || '100',
      offset: query.offset || '0',
      userId: query.uid,
      isWebview: 'true',
      includeRedHeart: 'true',
      includeTop: 'true',
    };
    return toModuleResponse(
      yield* request(
        buildApiRequestIntent(
          `/api/user/playlist/collect`,
          data,
          createOption(query),
        ),
      ),
    );
  });

/**
 * 获取用户的收藏歌单列表
 */
export default userPlaylistCollect;

export { decodeLegacyModuleInput as decodeModuleInput } from '../core/module-input.ts';

export type ModuleInput = LegacyModuleInput;
