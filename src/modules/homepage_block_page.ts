import { Effect } from 'effect';

import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';

const homepageBlockPage: ModuleEffect<ModuleInput> = (query, request) =>
  Effect.gen(function* () {
    const data = { refresh: query.refresh || false, cursor: query.cursor };
    return toModuleResponse(
      yield* request(
        buildApiRequestIntent(
          `/api/homepage/block/page`,
          data,
          createOption(query, 'weapi'),
        ),
      ),
    );
  });

/**
 * 首页-发现 block page
 * 这个接口为移动端接口，首页-发现页，数据结构可以参考 https://github.com/hcanyz/flutter-netease-music-api/blob/master/lib/src/api/uncategorized/bean.dart#L259 HomeBlockPageWrap
 * query.refresh 是否刷新数据
 */
export default homepageBlockPage;

export { decodeLegacyModuleInput as decodeModuleInput } from './_input.ts';

export type ModuleInput = LegacyModuleInput;
