import * as Effect from 'effect/Effect';
import * as Schema from 'effect/Schema';

import {
  decodeModuleInput as decodeInput,
  NaturalValue,
} from '../core/module-input.ts';
import type { ModuleActions } from '../core/request-actions.ts';
import { toModuleResponse } from '../core/response.ts';
import type { BodyType } from '../core/upstream-body.ts';
import {
  decodeUpstreamBody,
  defineModuleBody,
  Loose,
  Optional,
  UpstreamObject,
} from '../core/upstream-body.ts';
import type { ModuleEffect } from '../types/index.ts';

export type ModuleInput = {
  startTime?: NaturalValue;
  endTime?: NaturalValue;
  limit?: NaturalValue;
};

const inputSchema = Schema.Struct({
  startTime: Schema.optional(NaturalValue),
  endTime: Schema.optional(NaturalValue),
  limit: Schema.optional(NaturalValue),
});

export const decodeModuleInput = (input: unknown) =>
  decodeInput(inputSchema, input);

export const moduleActions = {
  request: {
    profile: 'web',
    target: '/api/vipmusic/newrecord/weekflow',
    semantic: 'read',
    cache: 'none',
    retry: 'connect',
  },
} as const satisfies ModuleActions;

const SongInfo = UpstreamObject({
  songId: Loose(Schema.Finite),
  songName: Loose(Schema.String),
  count: Loose(Schema.Finite),
  mainArtistName: Loose(Schema.String),
  artistNames: Loose(Schema.String),
  online: Loose(Schema.Boolean),
  songStype: Schema.String.pipe(Schema.Array, Loose),
  coverUrl: Loose(Schema.String),
  artistMap: Loose(Schema.Record(Schema.String, Schema.String)),
  albumName: Loose(Schema.String),
  tag: Loose(Schema.String),
});

const Player = UpstreamObject({
  id: Loose(Schema.Finite),
  artistName: Loose(Schema.String),
  aliasName: Loose(Schema.String),
  cover: Loose(Schema.String),
  hasRelation: Loose(Schema.Boolean),
  fansCount: Loose(Schema.Finite),
  fansShow: Loose(Schema.String),
  userId: Loose(Schema.Finite),
  tag: Loose(Schema.String),
});

const TimemachineAlbumInfo = UpstreamObject({
  count: Loose(Schema.Finite),
  details: UpstreamObject({
    albumId: Loose(Schema.Finite),
    albumName: Loose(Schema.String),
    coverUrl: Loose(Schema.String),
    online: Loose(Schema.Boolean),
    playerId: Loose(Schema.Finite),
    playerName: Loose(Schema.String),
    tag: Loose(Schema.String),
  }).pipe(Schema.Array, Loose),
});

const PlayerList = UpstreamObject({
  count: Loose(Schema.Finite),
  players: Player.pipe(Schema.Array, Loose),
});

const SingleList = UpstreamObject({
  count: Loose(Schema.Finite),
  singles: SongInfo.pipe(Schema.Array, Loose),
});

const CommonStyle = UpstreamObject({
  styleDetailList: UpstreamObject({
    percent: Loose(Schema.String),
    styleName: Loose(Schema.String),
  }).pipe(Schema.Array, Loose),
});

const DurationItem = UpstreamObject({
  count: Loose(Schema.Finite),
  duration: Loose(Schema.Finite),
  intervel: Loose(Schema.Finite),
  intervelType: Loose(Schema.Finite),
  playCntRate: Loose(Schema.String),
});

const DayDetail = UpstreamObject({
  day: Loose(Schema.Finite),
  duration: Loose(Schema.Finite),
});

const MusicEmotion = UpstreamObject({
  emotions: UpstreamObject({
    type: Loose(Schema.Finite),
    detail: UpstreamObject({
      day: Loose(Schema.Finite),
      percent: Loose(Schema.String),
    }).pipe(Schema.Array, Loose),
  }).pipe(Schema.Array, Loose),
  subTitle: Schema.String.pipe(Schema.Array, Loose),
});

const MusicYear = UpstreamObject({
  percent: Loose(Schema.String),
  total: Loose(Schema.Finite),
  year: Loose(Schema.Finite),
  yearPercents: UpstreamObject({
    endYear: Loose(Schema.Finite),
    percent: Loose(Schema.String),
    startYear: Loose(Schema.Finite),
  }).pipe(Schema.Array, Loose),
  yearSingles: SongInfo.pipe(Schema.Array, Loose),
});

const RecommendPlayList = UpstreamObject({
  count: Loose(Schema.Finite),
  cover: Loose(Schema.String),
  id: Loose(Schema.Finite),
  name: Loose(Schema.String),
  playCountShow: Loose(Schema.String),
});

const SecondStyle = UpstreamObject({
  name: Loose(Schema.String),
  secondStyleId: Loose(Schema.Finite),
  song: Loose(SongInfo),
});

const TimemachineData = UpstreamObject({
  appDurationDataList: DurationItem.pipe(Schema.Array, Loose),
  details: DayDetail.pipe(Schema.Array, Loose),
  endSong: Loose(SongInfo),
  endTime: Loose(Schema.Finite),
  intervelCount: Loose(Schema.Finite),
  intervelDurationDataList: DurationItem.pipe(Schema.Array, Loose),
  intervelType: Loose(Schema.Finite),
  keyword: Loose(Schema.String),
  listenAlbum: Loose(Schema.Finite),
  listenAlbumInfo: Loose(TimemachineAlbumInfo),
  listenCommonStyle: Loose(CommonStyle),
  listenPlayer: Loose(PlayerList),
  listenPlayerSong: Loose(Schema.Finite),
  listenSingle: Loose(SingleList),
  listenSongs: Loose(Schema.Finite),
  listenStyleSongs: Loose(Schema.Finite),
  listenTime: Loose(Schema.Finite),
  listenWeekCount: Loose(Schema.Finite),
  listenWeekTime: Loose(Schema.Finite),
  musicEmotion: Loose(MusicEmotion),
  musicYear: Loose(MusicYear),
  newStyleName: Loose(Schema.String),
  percent: Loose(Schema.String),
  player: Loose(Player),
  recommendPlayList: RecommendPlayList.pipe(Schema.Array, Loose),
  recommendPlayers: Player.pipe(Schema.Array, Loose),
  recommendSongs: SongInfo.pipe(Schema.Array, Loose),
  secondStyleDataList: SecondStyle.pipe(Schema.Array, Loose),
  songInfos: SongInfo.pipe(Schema.Array, Loose),
  startSong: Loose(SongInfo),
  startTime: Loose(Schema.Finite),
  styleId: Loose(Schema.Finite),
  styleName: Loose(Schema.String),
  subTitle: Loose(Schema.String),
  totalAlbum: Loose(Schema.Finite),
  totalSong: Loose(Schema.Finite),
  tsNum: Loose(Schema.Finite),
  version: Loose(Schema.Finite),
});

const TimemachineDetail = UpstreamObject({
  rowKey: Schema.String,
  data: TimemachineData,
  dayTime: Loose(Schema.Finite),
  next: Loose(Schema.Finite),
  nextVersion: Loose(Schema.Finite),
  prev: Loose(Schema.Finite),
  preVersion: Loose(Schema.Finite),
  showFree: Loose(Schema.Boolean),
  type: Loose(Schema.Finite),
  userId: Loose(Schema.Finite),
  weekEndTime: Loose(Schema.Finite),
  weekStartTime: Loose(Schema.Finite),
});

// 返回码、时光机页的路径 `data`、周报列表 `data.detail`（无记录时为 `null`）、每份周报自己的 `rowKey` 收紧；报告体 `data.detail[].data` 必填，缺失、`null` 或非对象时报 502，四种 `type` 的报告内容共用一个宽松结构。
export const ModuleBody = /* @__PURE__ */ defineModuleBody(
  UpstreamObject({
    code: Schema.Literal(200),
    data: UpstreamObject({
      beta: Loose(Schema.Boolean),
      detail: TimemachineDetail.pipe(Schema.Array, Optional),
      hasnext: Loose(Schema.Boolean),
      notVipLimitNum: Loose(Schema.Finite),
      recordTime: Loose(Schema.Finite),
      showcashier: Loose(Schema.Boolean),
    }),
    message: Loose(Schema.String),
  }),
);
export type ModuleBody = BodyType<typeof ModuleBody>;

const vipTimemachine: ModuleEffect<
  ModuleInput,
  ModuleBody,
  typeof moduleActions
> = (query, request) =>
  Effect.gen(function* () {
    const data: Record<string, unknown> = {};
    if (query.startTime && query.endTime) {
      data.startTime = query.startTime;
      data.endTime = query.endTime;
      data.type = 1;
      data.limit = query.limit || 60;
    }
    const response = yield* request('request', { data });
    const body = yield* decodeUpstreamBody(
      'vip_timemachine',
      ModuleBody,
      response,
    );
    return { ...toModuleResponse(response), body };
  });

/**
 * 黑胶时光机
 */
export default vipTimemachine;
