import * as Effect from 'effect/Effect';
import * as Schema from 'effect/Schema';

import { decodeModuleInput as decodeInput } from '../core/module-input.ts';
import type { ModuleActions } from '../core/request-actions.ts';
import { toModuleResponse } from '../core/response.ts';
import type { BodyType } from '../core/upstream-body.ts';
import {
  decodeUpstreamBody,
  defineModuleBody,
  Loose,
  UpstreamObject,
} from '../core/upstream-body.ts';
import type { ModuleEffect } from '../types/index.ts';

export const moduleActions = {
  request: {
    profile: 'web',
    target: '/api/act/modules/signin/v2/progress',
    semantic: 'read',
    cache: 'none',
    retry: 'connect',
  },
} as const satisfies ModuleActions;

export type ModuleInput = {
  moduleId?: string;
};

const inputSchema = Schema.Struct({
  moduleId: Schema.optional(Schema.String),
});

export const decodeModuleInput = (input: unknown) =>
  decodeInput(inputSchema, input);

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
  prizes: Prize.pipe(Schema.Array, Loose),
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
export const ModuleBody = /* @__PURE__ */ defineModuleBody(
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
export type ModuleBody = BodyType<typeof ModuleBody>;

const signinProgress: ModuleEffect<
  ModuleInput,
  ModuleBody,
  typeof moduleActions
> = (query, request) =>
  Effect.gen(function* () {
    const data = {
      moduleId: query.moduleId || '1207signin-1207signin',
    };
    const response = yield* request('request', { data });
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
