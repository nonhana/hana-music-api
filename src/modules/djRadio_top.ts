import { Effect } from 'effect';

import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';

const djRadioTop: ModuleEffect<ModuleInput> = (query, request) =>
  Effect.gen(function* () {
    const data = {
      djRadioId: query.djRadioId || null, // 电台id
      sortIndex: query.sortIndex || 1, // 排序 1:播放数 2:点赞数 3：评论数 4：分享数 5：收藏数
      dataGapDays: query.dataGapDays || 7, // 天数 7:一周 30:一个月 90:三个月
      dataType: query.dataType || 3, // 未知
    };
    return toModuleResponse(
      yield* request(
        buildApiRequestIntent(
          '/api/expert/worksdata/works/top/get',
          data,
          createOption(query),
        ),
      ),
    );
  });

/**
 * 电台排行榜获取
 */
export default djRadioTop;

export { decodeLegacyModuleInput as decodeModuleInput } from './_input.ts';

export type ModuleInput = LegacyModuleInput;
