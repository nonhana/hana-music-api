import { Effect } from 'effect';

import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';

const homepageDragonBall: ModuleEffect<ModuleInput> = (query, request) =>
  Effect.gen(function* () {
    const data = {};

    return toModuleResponse(
      yield* request(
        buildApiRequestIntent(
          `/api/homepage/dragon/ball/static`,
          data,
          createOption(query),
        ),
      ),
    );
  });

/**
 * 首页-发现 dragon ball
 * 这个接口为移动端接口，首页-发现页（每日推荐、歌单、排行榜 那些入口）
 * 数据结构可以参考 https://github.com/hcanyz/flutter-netease-music-api/blob/master/lib/src/api/uncategorized/bean.dart#L290 HomeDragonBallWrap
 * !需要登录或者游客登录，非登录返回 []
 */
export default homepageDragonBall;

export { decodeLegacyModuleInput as decodeModuleInput } from '../core/module-input.ts';

export type ModuleInput = LegacyModuleInput;
