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

const Prize = UpstreamObject({
  amount: Loose(Schema.Finite),
  description: Loose(Schema.String),
  name: Loose(Schema.String),
  obtained: Loose(Schema.Boolean),
  obtainedImageUrl: Loose(Schema.String),
  prizeImageUrl: Loose(Schema.String),
  progress: Loose(Schema.Finite),
  type: Loose(Schema.String),
  url: Loose(Schema.String),
});

const SigninStat = UpstreamObject({
  id: Schema.Finite,
  calcType: Loose(Schema.String),
  currentProgress: Loose(Schema.Finite),
  description: Loose(Schema.String),
  endTime: Loose(Schema.Finite),
  maxProgressReachDay: Loose(Schema.String),
  maxProgressReached: Loose(Schema.Finite),
  prizes: Loose(Schema.Array(Prize)),
  repeatType: Loose(Schema.String),
  startDay: Loose(Schema.String),
  startTime: Loose(Schema.Finite),
});

const SigninRecord = UpstreamObject({
  day: Schema.String,
  signed: Loose(Schema.Boolean),
});

// 返回码、签到页的路径 `data`、今日签到块 `data.today` 及其 `todaySignedIn`、签到记录 `data.records`
// 及每条记录的日期 `day`、签到统计 `data.stats` 与 `data.today.todayStats` 及统计 `id` 收紧；
// 签到记录的 `signed`、统计和奖品里的其余字段宽松。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    data: UpstreamObject({
      records: Schema.Array(SigninRecord),
      stats: Schema.Array(SigninStat),
      today: UpstreamObject({
        todaySignedIn: Schema.Boolean,
        todayStats: Schema.Array(SigninStat),
      }),
      endTime: Loose(Schema.Finite),
      startTime: Loose(Schema.Finite),
    }),
    message: Loose(Schema.String),
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

const signinProgress: ModuleEffect<ModuleInput, ModuleBody> = (
  query,
  request,
) =>
  Effect.gen(function* () {
    const data = {
      moduleId: query.moduleId || '1207signin-1207signin',
    };
    const response = yield* request(
      buildApiRequestIntent(
        `/api/act/modules/signin/v2/progress`,
        data,
        createOption(query, 'weapi'),
      ),
    );
    const body = yield* decodeUpstreamBody(
      'signin_progress',
      ModuleBody,
      response,
    );
    return { ...toModuleResponse(response), body };
  });

/**
 * 签到进度
 */
export default signinProgress;

export { decodeLegacyModuleInput as decodeModuleInput } from '../core/module-input.ts';

export type ModuleInput = LegacyModuleInput;
