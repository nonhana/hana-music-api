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

const PaidRadio = UpstreamObject({
  id: Schema.Finite,
  creatorName: Loose(Schema.String),
  lastRank: Loose(Schema.Finite),
  name: Loose(Schema.String),
  picUrl: Loose(Schema.String),
  rank: Loose(Schema.Finite),
  score: Loose(Schema.Finite),
});

// 通到付费榜的路径 `data`、`data.list` 和榜上电台自己的编号 `data.list[].id` 收紧；`data.total`、
// `data.updateTime`、排名、分数宽松。`msg` 在成功录制里只见过 null，未声明。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    data: UpstreamObject({
      total: Loose(Schema.Finite),
      updateTime: Loose(Schema.Finite),
      list: Schema.Array(PaidRadio),
    }),
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

const djToplistPay: ModuleEffect<ModuleInput, ModuleBody> = (query, request) =>
  Effect.gen(function* () {
    const data = {
      limit: query.limit || 100,
      // 不支持 offset
    };
    const response = yield* request(
      buildApiRequestIntent(
        `/api/djradio/toplist/pay`,
        data,
        createOption(query, 'weapi'),
      ),
    );
    const body = yield* decodeUpstreamBody(
      'dj_toplist_pay',
      ModuleBody,
      response,
    );
    return { ...toModuleResponse(response), body };
  });

/**
 * 付费精品
 */
export default djToplistPay;

export { decodeLegacyModuleInput as decodeModuleInput } from '../core/module-input.ts';

export type ModuleInput = LegacyModuleInput;
