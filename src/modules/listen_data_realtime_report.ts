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

const DurationDetail = UpstreamObject({
  audiobookDuration: Loose(Schema.Finite),
  duration: Loose(Schema.Finite),
  period: Loose(Schema.String),
  podcastDuration: Loose(Schema.Finite),
  reachLimit: Loose(Schema.Boolean),
});

const SleepBlock = UpstreamObject({
  avgDayPlayDuration: Loose(Schema.Finite),
  sleepDurationDetails: Loose(Schema.Array(DurationDetail)),
  sleepListenDays: Loose(Schema.Finite),
  sleepPlayDuration: Loose(Schema.Finite),
});

const DistributionBlock = UpstreamObject({
  blockType: Loose(Schema.String),
  durationDetails: Loose(Schema.Array(DurationDetail)),
  listenDays: Loose(Schema.Finite),
  playDuration: Loose(Schema.Finite),
  sleepTdBlock: Loose(SleepBlock),
});

const TodayBlock = UpstreamObject({
  coverUrls: Loose(Schema.Array(Schema.String)),
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
  friendListenRecords: Loose(Schema.Array(FriendRecord)),
});

// 接口返回的 `data` 收紧；`data` 里的时长分布、今日和好友块是附带统计，块内字段全部宽松。
export const ModuleBody = Schema.toStandardSchemaV1(
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
export type ModuleBody = typeof ModuleBody.Type;

const listenDataRealtimeReport: ModuleEffect<ModuleInput, ModuleBody> = (
  query,
  request,
) =>
  Effect.gen(function* () {
    const response = yield* request(
      buildApiRequestIntent(
        `/api/content/activity/listen/data/realtime/report`,
        {
          type: query.type || 'week', //周 week 月 month
        },
        createOption(query),
      ),
    );
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

export { decodeLegacyModuleInput as decodeModuleInput } from '../core/module-input.ts';

export type ModuleInput = LegacyModuleInput;
