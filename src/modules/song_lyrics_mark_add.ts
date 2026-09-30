import { Effect } from 'effect';

import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';

const songLyricsMarkAdd: ModuleEffect<ModuleInput> = (query, request) =>
  Effect.gen(function* () {
    const data = {
      songId: query.id,
      markId: query.markId || '',
      data: query.data || '[]',
      // "[{\"translateType\":1,\"startTimeStamp\":800,\"translateLyricsText\":\"让我逃走吧、声音已经枯萎\",\"originalLyricsText\":\"逃がしてくれって声を枯らした\"},{\"translateType\":1,\"startTimeStamp\":4040,\"translateLyricsText\":\"我的愿望究竟会实现吗\",\"originalLyricsText\":\"あたしの願いなど叶うでしょうか\"}]"
    };
    return toModuleResponse(
      yield* request(
        buildApiRequestIntent(
          `/api/song/play/lyrics/mark/add`,
          data,
          createOption(query),
        ),
      ),
    );
  });

/**
 * 歌词摘录 - 添加/修改摘录歌词
 */
export default songLyricsMarkAdd;

export { decodeLegacyModuleInput as decodeModuleInput } from './_input.ts';

export type ModuleInput = LegacyModuleInput;
