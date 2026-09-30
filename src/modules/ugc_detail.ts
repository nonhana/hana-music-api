import { Effect } from 'effect';

import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';

const ugcDetail: ModuleEffect<ModuleInput> = (query, request) =>
  Effect.gen(function* () {
    const data = {
      auditStatus: query.auditStatus || '',
      //待审核:0 未采纳:-5 审核中:1 部分审核通过:4 审核通过:5
      //WAIT:0 REJECT:-5 AUDITING:1 PARTLY_APPROVED:4 PASS:5
      limit: query.limit || 10,
      offset: query.offset || 0,
      order: query.order || 'desc', //asc
      sortBy: query.sortBy || 'createTime',
      type: query.type || 1,
      //曲库纠错 ARTIST:1 ALBUM:2 SONG:3 MV:4 LYRIC:5 TLYRIC:6
      //曲库补充 ALBUM:101 MV:103
    };
    return toModuleResponse(
      yield* request(
        buildApiRequestIntent(
          `/api/rep/ugc/detail`,
          data,
          createOption(query, 'weapi'),
        ),
      ),
    );
  });

/**
 * 用户贡献内容
 */
export default ugcDetail;

export { decodeLegacyModuleInput as decodeModuleInput } from './_input.ts';

export type ModuleInput = LegacyModuleInput;
