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

const OverviewData = UpstreamObject({
  availableExtractIncomeTotal: Loose(Schema.String),
  musicianLevelScore: Loose(Schema.Finite),
  productionTotal: Loose(Schema.Finite),
  totalFansCount: Loose(Schema.Finite),
});

// 返回码和通到概况对象的路径 `data` 收紧；各项统计宽松，
// `followerCountIncrement`、`playCount`、`fansPlayCount`、`fansPlayRatio`、`totalPlayCount` 只见过 `null`，没有声明。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    data: OverviewData,
    message: Loose(Schema.String),
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

const musicianDataOverview: ModuleEffect<ModuleInput, ModuleBody> = (
  query,
  request,
) =>
  Effect.gen(function* () {
    const data = {};
    const response = yield* request(
      buildApiRequestIntent(
        `/api/creator/musician/statistic/data/overview/get`,
        data,
        createOption(query, 'weapi'),
      ),
    );
    const body = yield* decodeUpstreamBody(
      'musician_data_overview',
      ModuleBody,
      response,
    );
    return { ...toModuleResponse(response), body };
  });

/**
 * 音乐人数据概况
 */
export default musicianDataOverview;

export { decodeLegacyModuleInput as decodeModuleInput } from '../core/module-input.ts';

export type ModuleInput = LegacyModuleInput;
