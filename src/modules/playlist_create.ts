import { Effect } from 'effect';

import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';

const playlistCreate: ModuleEffect<ModuleInput> = (query, request) =>
  Effect.gen(function* () {
    const data = {
      name: query.name,
      privacy: query.privacy || '0', // 0 普通歌单, 10 隐私歌单
      type: query.type || 'NORMAL', // 默认 NORMAL, VIDEO 视频歌单, SHARED 共享歌单
    };
    return toModuleResponse(
      yield* request(
        buildApiRequestIntent(
          `/api/playlist/create`,
          data,
          createOption(query, 'weapi'),
        ),
      ),
    );
  });

/**
 * 创建歌单
 */
export default playlistCreate;

export { decodeLegacyModuleInput as decodeModuleInput } from '../core/module-input.ts';

export type ModuleInput = LegacyModuleInput;
