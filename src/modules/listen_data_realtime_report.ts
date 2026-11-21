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
    profile: 'eapi',
    target: '/api/content/activity/listen/data/realtime/report',
    semantic: 'read',
    cache: 'none',
    retry: 'never',
  },
} as const satisfies ModuleActions;

export type ModuleInput = { type?: 'week' | 'month' };

const inputSchema = Schema.Struct({
  type: Schema.optional(Schema.Literals(['week', 'month'])),
});

export const decodeModuleInput = (input: unknown) =>
  decodeInput(inputSchema, input);

const DurationDetail = UpstreamObject({
  audiobookDuration: Loose(Schema.Finite),
  duration: Loose(Schema.Finite),
  period: Loose(Schema.String),
  podcastDuration: Loose(Schema.Finite),
  reachLimit: Loose(Schema.Boolean),
});

const SleepBlock = UpstreamObject({
  avgDayPlayDuration: Loose(Schema.Finite),
  sleepDurationDetails: DurationDetail.pipe(Schema.Array, Loose),
  sleepListenDays: Loose(Schema.Finite),
  sleepPlayDuration: Loose(Schema.Finite),
});

const DistributionBlock = UpstreamObject({
  blockType: Loose(Schema.String),
  durationDetails: DurationDetail.pipe(Schema.Array, Loose),
  listenDays: Loose(Schema.Finite),
  playDuration: Loose(Schema.Finite),
  sleepTdBlock: Loose(SleepBlock),
});

const TodayBlock = UpstreamObject({
  coverUrls: Schema.String.pipe(Schema.Array, Loose),
  redCount: Loose(Schema.Finite),
  songCount: Loose(Schema.Finite),
});

const FriendRecord = UpstreamObject({
  artistId: Loose(Schema.Finite),
  artistName: Loose(Schema.String),
  artistPicUrl: Loose(Schema.String),
  collect: Loose(Schema.Boolean),
  latestListenTime: Loose(Schema.Finite),
  songId: Loose(Schema.Finite),
  songName: Loose(Schema.String),
  songPicUrl: Loose(Schema.String),
  userAvatar: Loose(Schema.String),
  userId: Loose(Schema.Finite),
  username: Loose(Schema.String),
});

const FriendsBlock = UpstreamObject({
  friendListenRecords: FriendRecord.pipe(Schema.Array, Loose),
});

// 接口返回的 `data` 收紧；`data` 里的时长分布、今日和好友块是附带统计，块内字段全部宽松。
export const ModuleBody = /* @__PURE__ */ defineModuleBody(
  UpstreamObject({
    code: Schema.Literal(200),
    data: UpstreamObject({
      endTime: Loose(Schema.Finite),
      listenTimeDistributionBlock: Loose(DistributionBlock),
      startTime: Loose(Schema.Finite),
      type: Loose(Schema.String),
      weekFriendsListenBlock: Loose(FriendsBlock),
      weekTodayListenBlock: Loose(TodayBlock),
    }),
    message: Loose(Schema.String),
  }),
);
export type ModuleBody = BodyType<typeof ModuleBody>;

const listenDataRealtimeReport: ModuleEffect<
  ModuleInput,
  ModuleBody,
  typeof moduleActions
> = (query, request) =>
  Effect.gen(function* () {
    const response = yield* request('request', {
      data: {
        type: query.type || 'week', //周 week 月 month
      },
    });
    const body = yield* decodeUpstreamBody(
      'listen_data_realtime_report',
      ModuleBody,
      response,
    );
    return { ...toModuleResponse(response), body };
  });

/**
 * 听歌足迹 - 本周/本月收听时长
 */
export default listenDataRealtimeReport;
