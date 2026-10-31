import { Effect, Schema } from 'effect';

import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import {
  decodeUpstreamBody,
  Loose,
  UpstreamObject,
} from '../core/upstream-body.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';

// 唯一收紧的路径是返回码 `code`；登录和匿名录制里 `data` 都是空数组，入口元素类型没有证据，未声明并原样保留。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    message: Loose(Schema.String),
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

const homepageDragonBall: ModuleEffect<ModuleInput, ModuleBody> = (
  query,
  request,
) =>
  Effect.gen(function* () {
    const data = {};

    const response = yield* request(
      buildApiRequestIntent(
        `/api/homepage/dragon/ball/static`,
        data,
        createOption(query),
      ),
    );
    const body = yield* decodeUpstreamBody(
      'homepage_dragon_ball',
      ModuleBody,
      response,
    );
    return { ...toModuleResponse(response), body };
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
