import { Effect, Schema } from 'effect';

import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import {
  decodeUpstreamBody,
  Loose,
  UpstreamObject,
} from '../core/upstream-body.ts';
import { DjProgram } from '../core/upstream-schemas.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';

const ToplistEntry = UpstreamObject({
  program: DjProgram,
  lastRank: Loose(Schema.Finite),
  programFeeType: Loose(Schema.Finite),
  rank: Loose(Schema.Finite),
  score: Loose(Schema.Finite),
});

// 通到 24 小时节目榜的路径 `data.list` 和榜上节目自己的编号 `data.list[].program.id` 收紧；排名、分数、`programFeeType` 和统计字段宽松。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    data: UpstreamObject({
      list: Schema.Array(ToplistEntry),
      total: Loose(Schema.Finite),
      updateTime: Loose(Schema.Finite),
    }),
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

const djProgramToplistHours: ModuleEffect<ModuleInput, ModuleBody> = (
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
        `/api/djprogram/toplist/hours`,
        data,
        createOption(query, 'weapi'),
      ),
    );
    const body = yield* decodeUpstreamBody(
      'dj_program_toplist_hours',
      ModuleBody,
      response,
    );
    return { ...toModuleResponse(response), body };
  });

/**
 * 电台24小时节目榜
 */
export default djProgramToplistHours;

export { decodeLegacyModuleInput as decodeModuleInput } from '../core/module-input.ts';

export type ModuleInput = LegacyModuleInput;
