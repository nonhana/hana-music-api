import { Effect, Schema } from 'effect';

import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import {
  decodeUpstreamBody,
  Loose,
  UpstreamObject,
} from '../core/upstream-body.ts';
import { DjAnchorRank } from '../core/upstream-schemas.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';

// 通到主播榜的路径 `data.list` 和榜上主播自己的编号 `data.list[].id` 收紧；排名、分数、头像、认证、
// 直播状态、`data.total` 和 `data.updateTime` 宽松。`msg` 在成功录制里只见过 null，未声明。
// 三个主播榜（hours/newcomer/popular）的 envelope 字段相同，本批作为模块公开合同暂留，后续统一榜单结构时再抽 core。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    data: UpstreamObject({
      total: Loose(Schema.Finite),
      updateTime: Loose(Schema.Finite),
      list: Schema.Array(DjAnchorRank),
    }),
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

const djToplistPopular: ModuleEffect<ModuleInput, ModuleBody> = (
  query,
  request,
) =>
  Effect.gen(function* () {
    const data = {
      limit: query.limit || 100,
      // 不支持 offset
    };
    const response = yield* request(
      buildApiRequestIntent(
        `/api/dj/toplist/popular`,
        data,
        createOption(query, 'weapi'),
      ),
    );
    const body = yield* decodeUpstreamBody(
      'dj_toplist_popular',
      ModuleBody,
      response,
    );
    return { ...toModuleResponse(response), body };
  });

/**
 * 电台最热主播榜
 */
export default djToplistPopular;

export { decodeLegacyModuleInput as decodeModuleInput } from '../core/module-input.ts';

export type ModuleInput = LegacyModuleInput;
