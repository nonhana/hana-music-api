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
  UpstreamObject,
} from '../core/upstream-body.ts';
import type { ModuleEffect } from '../types/index.ts';

export const moduleActions = {
  request: {
    profile: 'eapi',
    target: '/api/content/activity/listen/data/report',
    semantic: 'read',
    cache: 'none',
    retry: 'never',
  },
} as const satisfies ModuleActions;

export type ModuleInput = {
  endTime?: NaturalValue;
  type?: 'week' | 'month' | 'year';
};

const inputSchema = Schema.Struct({
  endTime: Schema.optional(NaturalValue),
  type: Schema.optional(Schema.Literals(['week', 'month', 'year'])),
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

const ListenTimeBlock = UpstreamObject({
  blockType: Loose(Schema.String),
  circleTimePeriodDurations: UpstreamObject({
    duration: Loose(Schema.Finite),
    period: Loose(Schema.String),
  }).pipe(Schema.Array, Loose),
  playDuration: Loose(Schema.Finite),
  playDurationText: Loose(Schema.String),
  sections: UpstreamObject({
    field: Loose(Schema.String),
    textB: Loose(Schema.String),
    type: Loose(Schema.String),
    valueA: Loose(Schema.String),
  }).pipe(Schema.Array, Loose),
});

const TimeDistributionBlock = UpstreamObject({
  achievementTitle: Loose(
    UpstreamObject({
      mainTitle: Loose(Schema.String),
      subTitle: Loose(Schema.String),
    }),
  ),
  blockType: Loose(Schema.String),
  durationDetails: DurationDetail.pipe(Schema.Array, Loose),
  listenDays: Loose(Schema.Finite),
  playDuration: Loose(Schema.Finite),
  sections: UpstreamObject({
    type: Loose(Schema.String),
    value: Loose(Schema.String),
  }).pipe(Schema.Array, Loose),
});

const WallpaperBlock = UpstreamObject({
  blockType: Loose(Schema.String),
  items: UpstreamObject({
    artists: UpstreamObject({
      artistId: Loose(Schema.Finite),
      artistName: Loose(Schema.String),
    }).pipe(Schema.Array, Loose),
    picId: Loose(Schema.Finite),
    picUrl: Loose(Schema.String),
    songId: Loose(Schema.Finite),
    songName: Loose(Schema.String),
  }).pipe(Schema.Array, Loose),
  picUrls: Schema.String.pipe(Schema.Array, Loose),
  songCount: Loose(Schema.Finite),
});

const TopSongBlock = UpstreamObject({
  artists: UpstreamObject({
    artistId: Loose(Schema.Finite),
    artistName: Loose(Schema.String),
  }).pipe(Schema.Array, Loose),
  blockType: Loose(Schema.String),
  items: UpstreamObject({
    field: Loose(Schema.String),
    mainText: Loose(Schema.String),
    subText: Loose(Schema.String),
    type: Loose(Schema.String),
  }).pipe(Schema.Array, Loose),
  picUrl: Loose(Schema.String),
  playCount: Loose(Schema.Finite),
  sections: UpstreamObject({
    field: Loose(Schema.String),
    picUrl: Loose(Schema.String),
    songId: Loose(Schema.Finite),
    songName: Loose(Schema.String),
    text: Loose(Schema.String),
    type: Loose(Schema.String),
  }).pipe(Schema.Array, Loose),
  songId: Loose(Schema.Finite),
  songName: Loose(Schema.String),
});

const TopArtistBlock = UpstreamObject({
  artisId: Loose(Schema.Finite),
  artistName: Loose(Schema.String),
  avatarUrl: Loose(Schema.String),
  blockType: Loose(Schema.String),
  items: UpstreamObject({
    field: Loose(Schema.String),
    mainText: Loose(Schema.String),
    resourceId: Loose(Schema.String),
    subText: Loose(Schema.String),
    type: Loose(Schema.String),
  }).pipe(Schema.Array, Loose),
  playCount: Loose(Schema.Finite),
  sections: UpstreamObject({
    artistId: Loose(Schema.Finite),
    artistName: Loose(Schema.String),
    field: Loose(Schema.String),
    picUrl: Loose(Schema.String),
    text: Loose(Schema.String),
    type: Loose(Schema.String),
  }).pipe(Schema.Array, Loose),
});

const TopStyleBlock = UpstreamObject({
  blockType: Loose(Schema.String),
  genreEnglishName: Loose(Schema.String),
  genreId: Loose(Schema.Finite),
  genreName: Loose(Schema.String),
  items: UpstreamObject({
    field: Loose(Schema.String),
    mainText: Loose(Schema.String),
    resourceId: Loose(Schema.String),
    subText: Loose(Schema.String),
    type: Loose(Schema.String),
  }).pipe(Schema.Array, Loose),
  picUrl: Loose(Schema.String),
  secondGenreEnglishName: Loose(Schema.String),
  secondGenreId: Loose(Schema.Finite),
  secondGenreName: Loose(Schema.String),
  sections: UpstreamObject({
    genreId: Loose(Schema.Finite),
    genreName: Loose(Schema.String),
    percent: Loose(Schema.String),
  }).pipe(Schema.Array, Loose),
  songId: Loose(Schema.Finite),
  songName: Loose(Schema.String),
});

const TopAgeBlock = UpstreamObject({
  age: Loose(Schema.String),
  blockType: Loose(Schema.String),
  picUrl: Loose(Schema.String),
  sections: UpstreamObject({
    age: Loose(Schema.String),
    playSongNum: Loose(Schema.Finite),
  }).pipe(Schema.Array, Loose),
  songId: Loose(Schema.Finite),
  songItems: UpstreamObject({
    picUrl: Loose(Schema.String),
    songId: Loose(Schema.Finite),
    songName: Loose(Schema.String),
    text: Loose(Schema.String),
  }).pipe(Schema.Array, Loose),
  songName: Loose(Schema.String),
  text: Loose(Schema.String),
});

const TopLanguageBlock = UpstreamObject({
  blockType: Loose(Schema.String),
  picUrl: Loose(Schema.String),
  sections: UpstreamObject({
    language: Loose(Schema.String),
    percent: Loose(Schema.String),
    playSongNum: Loose(Schema.Finite),
    songName: Loose(Schema.String),
  }).pipe(Schema.Array, Loose),
  songId: Loose(Schema.Finite),
  songItems: UpstreamObject({
    picUrl: Loose(Schema.String),
    songId: Loose(Schema.Finite),
    songName: Loose(Schema.String),
    text: Loose(Schema.String),
  }).pipe(Schema.Array, Loose),
  songName: Loose(Schema.String),
});

const VipBlock = UpstreamObject({
  blockType: Loose(Schema.String),
  picUrl: Loose(Schema.String),
  sections: UpstreamObject({
    field: Loose(Schema.String),
    mainText: Loose(Schema.String),
    subText: Loose(Schema.String),
    type: Loose(Schema.String),
  }).pipe(Schema.Array, Loose),
  songId: Loose(Schema.Finite),
  songName: Loose(Schema.String),
});

const FriendListenBlock = UpstreamObject({
  blockType: Loose(Schema.String),
  items: UpstreamObject({
    collect: Loose(Schema.Boolean),
    playCount: Loose(Schema.Finite),
    songId: Loose(Schema.Finite),
    songName: Loose(Schema.String),
    songPicUrl: Loose(Schema.String),
    userAvatar: Loose(Schema.String),
    userId: Loose(Schema.Finite),
    username: Loose(Schema.String),
  }).pipe(Schema.Array, Loose),
});

const FriendKeywordBlock = UpstreamObject({
  blockType: Loose(Schema.String),
  items: UpstreamObject({
    enumCode: Loose(Schema.String),
    friendList: UpstreamObject({
      userAvatar: Loose(Schema.String),
      userId: Loose(Schema.Finite),
      username: Loose(Schema.String),
    }).pipe(Schema.Array, Loose),
    friendsKeywordEnum: Loose(Schema.String),
    subTitle: Loose(Schema.String),
    title: Loose(Schema.String),
  }).pipe(Schema.Array, Loose),
});

// 通到周/月/年听歌报告的路径 `data` 收紧；各统计块是附带展示信息，字段全部宽松，没出现的块（年报、无收听周）原样保留。
export const ModuleBody = /* @__PURE__ */ defineModuleBody(
  UpstreamObject({
    code: Schema.Literal(200),
    data: UpstreamObject({
      endTime: Loose(Schema.Finite),
      friendsKeyWordMonthBlock: Loose(FriendKeywordBlock),
      friendsKeywordWeekBlock: Loose(FriendKeywordBlock),
      friendsListenMonthBlock: Loose(FriendListenBlock),
      friendsListenWeekBlock: Loose(FriendListenBlock),
      listenTimeBlock: Loose(ListenTimeBlock),
      listenTimeDistributionBlock: Loose(TimeDistributionBlock),
      startTime: Loose(Schema.Finite),
      topAgeBlock: Loose(TopAgeBlock),
      topArtistBlock: Loose(TopArtistBlock),
      topLanguageBlock: Loose(TopLanguageBlock),
      topSongBlock: Loose(TopSongBlock),
      topStyleBlock: Loose(TopStyleBlock),
      type: Loose(Schema.String),
      vipBlock: Loose(VipBlock),
      wallpaperBlock: Loose(WallpaperBlock),
    }),
    message: Loose(Schema.String),
  }),
);
export type ModuleBody = BodyType<typeof ModuleBody>;

const listenDataReport: ModuleEffect<
  ModuleInput,
  ModuleBody,
  typeof moduleActions
> = (query, request) =>
  Effect.gen(function* () {
    const response = yield* request('request', {
      data: {
        type: query.type || 'week', //周 week 月 month 年 year
        endTime: query.endTime, // 不填就是本周/月的
      },
    });
    const body = yield* decodeUpstreamBody(
      'listen_data_report',
      ModuleBody,
      response,
    );
    return { ...toModuleResponse(response), body };
  });

/**
 * 听歌足迹 - 周/月/年收听报告
 */
export default listenDataReport;
