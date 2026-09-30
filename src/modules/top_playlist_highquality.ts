import { Effect } from 'effect';

import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';

const topPlaylistHighquality: ModuleEffect<ModuleInput> = (query, request) =>
  Effect.gen(function* () {
    const data = {
      cat: query.cat || '全部', // 全部,华语,欧美,韩语,日语,粤语,小语种,运动,ACG,影视原声,流行,摇滚,后摇,古风,民谣,轻音乐,电子,器乐,说唱,古典,爵士
      limit: query.limit || 50,
      lasttime: query.before || 0, // 歌单updateTime
      total: true,
    };
    return toModuleResponse(
      yield* request(
        buildApiRequestIntent(
          `/api/playlist/highquality/list`,
          data,
          createOption(query, 'weapi'),
        ),
      ),
    );
  });

/**
 * 精品歌单
 */
export default topPlaylistHighquality;

export { decodeLegacyModuleInput as decodeModuleInput } from './_input.ts';

export type ModuleInput = LegacyModuleInput;
