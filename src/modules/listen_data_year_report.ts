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

const YearItem = UpstreamObject({
  playDuration: Loose(Schema.Finite),
  playNum: Loose(Schema.Finite),
  year: Schema.Finite,
});

// 通到年度听歌足迹列表的路径 `data.yearItems` 和每年的 `year` 收紧；`displayYear` 与其余字段宽松。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    data: UpstreamObject({
      displayYear: Loose(Schema.Finite),
      yearItems: Schema.Array(YearItem),
    }),
    message: Loose(Schema.String),
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

const listenDataYearReport: ModuleEffect<ModuleInput, ModuleBody> = (
  query,
  request,
) =>
  Effect.gen(function* () {
    const response = yield* request(
      buildApiRequestIntent(
        `/api/content/activity/listen/data/year/report`,
        {},
        createOption(query),
      ),
    );
    const body = yield* decodeUpstreamBody(
      'listen_data_year_report',
      ModuleBody,
      response,
    );
    return { ...toModuleResponse(response), body };
  });

/**
 * 听歌足迹 - 年度听歌足迹
 */
export default listenDataYearReport;

export { decodeLegacyModuleInput as decodeModuleInput } from '../core/module-input.ts';

export type ModuleInput = LegacyModuleInput;
