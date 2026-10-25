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

const ListenTimeBlock = UpstreamObject({
  blockType: Loose(Schema.String),
  circleTimePeriodDurations: Loose(
    Schema.Array(
      UpstreamObject({
        duration: Loose(Schema.Finite),
        period: Loose(Schema.String),
      }),
    ),
  ),
  playDuration: Loose(Schema.Finite),
  playDurationText: Loose(Schema.String),
  sections: Loose(
    Schema.Array(
      UpstreamObject({
        field: Loose(Schema.String),
        textB: Loose(Schema.String),
        type: Loose(Schema.String),
        valueA: Loose(Schema.String),
      }),
    ),
  ),
});

const TimeDistributionBlock = UpstreamObject({
  achievementTitle: Loose(
    UpstreamObject({
      mainTitle: Loose(Schema.String),
      subTitle: Loose(Schema.String),
    }),
  ),
  blockType: Loose(Schema.String),
  durationDetails: Loose(Schema.Array(DurationDetail)),
  listenDays: Loose(Schema.Finite),
  playDuration: Loose(Schema.Finite),
  sections: Loose(
    Schema.Array(
      UpstreamObject({
        type: Loose(Schema.String),
        value: Loose(Schema.String),
      }),
    ),
  ),
});

const WallpaperBlock = UpstreamObject({
  blockType: Loose(Schema.String),
  items: Loose(
    Schema.Array(
      UpstreamObject({
        artists: Loose(
          Schema.Array(
            UpstreamObject({
              artistId: Loose(Schema.Finite),
              artistName: Loose(Schema.String),
            }),
          ),
        ),
        picId: Loose(Schema.Finite),
        picUrl: Loose(Schema.String),
        songId: Loose(Schema.Finite),
        songName: Loose(Schema.String),
      }),
    ),
  ),
  picUrls: Loose(Schema.Array(Schema.String)),
  songCount: Loose(Schema.Finite),
});

const TopSongBlock = UpstreamObject({
  artists: Loose(
    Schema.Array(
      UpstreamObject({
        artistId: Loose(Schema.Finite),
        artistName: Loose(Schema.String),
      }),
    ),
  ),
  blockType: Loose(Schema.String),
  items: Loose(
    Schema.Array(
      UpstreamObject({
        field: Loose(Schema.String),
        mainText: Loose(Schema.String),
        subText: Loose(Schema.String),
        type: Loose(Schema.String),
      }),
    ),
  ),
  picUrl: Loose(Schema.String),
  playCount: Loose(Schema.Finite),
  sections: Loose(
    Schema.Array(
      UpstreamObject({
        field: Loose(Schema.String),
        picUrl: Loose(Schema.String),
        songId: Loose(Schema.Finite),
        songName: Loose(Schema.String),
        text: Loose(Schema.String),
        type: Loose(Schema.String),
      }),
    ),
  ),
  songId: Loose(Schema.Finite),
  songName: Loose(Schema.String),
});

const TopArtistBlock = UpstreamObject({
  artisId: Loose(Schema.Finite),
  artistName: Loose(Schema.String),
  avatarUrl: Loose(Schema.String),
  blockType: Loose(Schema.String),
  items: Loose(
    Schema.Array(
      UpstreamObject({
        field: Loose(Schema.String),
        mainText: Loose(Schema.String),
        resourceId: Loose(Schema.String),
        subText: Loose(Schema.String),
        type: Loose(Schema.String),
      }),
    ),
  ),
  playCount: Loose(Schema.Finite),
  sections: Loose(
    Schema.Array(
      UpstreamObject({
        artistId: Loose(Schema.Finite),
        artistName: Loose(Schema.String),
        field: Loose(Schema.String),
        picUrl: Loose(Schema.String),
        text: Loose(Schema.String),
        type: Loose(Schema.String),
      }),
    ),
  ),
});

const TopStyleBlock = UpstreamObject({
  blockType: Loose(Schema.String),
  genreEnglishName: Loose(Schema.String),
  genreId: Loose(Schema.Finite),
  genreName: Loose(Schema.String),
  items: Loose(
    Schema.Array(
      UpstreamObject({
        field: Loose(Schema.String),
        mainText: Loose(Schema.String),
        resourceId: Loose(Schema.String),
        subText: Loose(Schema.String),
        type: Loose(Schema.String),
      }),
    ),
  ),
  picUrl: Loose(Schema.String),
  secondGenreEnglishName: Loose(Schema.String),
  secondGenreId: Loose(Schema.Finite),
  secondGenreName: Loose(Schema.String),
  sections: Loose(
    Schema.Array(
      UpstreamObject({
        genreId: Loose(Schema.Finite),
        genreName: Loose(Schema.String),
        percent: Loose(Schema.String),
      }),
    ),
  ),
  songId: Loose(Schema.Finite),
  songName: Loose(Schema.String),
});

const TopAgeBlock = UpstreamObject({
  age: Loose(Schema.String),
  blockType: Loose(Schema.String),
  picUrl: Loose(Schema.String),
  sections: Loose(
    Schema.Array(
      UpstreamObject({
        age: Loose(Schema.String),
        playSongNum: Loose(Schema.Finite),
      }),
    ),
  ),
  songId: Loose(Schema.Finite),
  songItems: Loose(
    Schema.Array(
      UpstreamObject({
        picUrl: Loose(Schema.String),
        songId: Loose(Schema.Finite),
        songName: Loose(Schema.String),
        text: Loose(Schema.String),
      }),
    ),
  ),
  songName: Loose(Schema.String),
  text: Loose(Schema.String),
});

const TopLanguageBlock = UpstreamObject({
  blockType: Loose(Schema.String),
  picUrl: Loose(Schema.String),
  sections: Loose(
    Schema.Array(
      UpstreamObject({
        language: Loose(Schema.String),
        percent: Loose(Schema.String),
        playSongNum: Loose(Schema.Finite),
        songName: Loose(Schema.String),
      }),
    ),
  ),
  songId: Loose(Schema.Finite),
  songItems: Loose(
    Schema.Array(
      UpstreamObject({
        picUrl: Loose(Schema.String),
        songId: Loose(Schema.Finite),
        songName: Loose(Schema.String),
        text: Loose(Schema.String),
      }),
    ),
  ),
  songName: Loose(Schema.String),
});

const VipBlock = UpstreamObject({
  blockType: Loose(Schema.String),
  picUrl: Loose(Schema.String),
  sections: Loose(
    Schema.Array(
      UpstreamObject({
        field: Loose(Schema.String),
        mainText: Loose(Schema.String),
        subText: Loose(Schema.String),
        type: Loose(Schema.String),
      }),
    ),
  ),
  songId: Loose(Schema.Finite),
  songName: Loose(Schema.String),
});

const FriendListenBlock = UpstreamObject({
  blockType: Loose(Schema.String),
  items: Loose(
    Schema.Array(
      UpstreamObject({
        collect: Loose(Schema.Boolean),
        playCount: Loose(Schema.Finite),
        songId: Loose(Schema.Finite),
        songName: Loose(Schema.String),
        songPicUrl: Loose(Schema.String),
        userAvatar: Loose(Schema.String),
        userId: Loose(Schema.Finite),
        username: Loose(Schema.String),
      }),
    ),
  ),
});

const FriendKeywordBlock = UpstreamObject({
  blockType: Loose(Schema.String),
  items: Loose(
    Schema.Array(
      UpstreamObject({
        enumCode: Loose(Schema.String),
        friendList: Loose(
          Schema.Array(
            UpstreamObject({
              userAvatar: Loose(Schema.String),
              userId: Loose(Schema.Finite),
              username: Loose(Schema.String),
            }),
          ),
        ),
        friendsKeywordEnum: Loose(Schema.String),
        subTitle: Loose(Schema.String),
        title: Loose(Schema.String),
      }),
    ),
  ),
});

// 通到周/月/年听歌报告的路径 `data` 收紧；各统计块是附带展示信息，字段全部宽松，没出现的块（年报、无收听周）原样保留。
export const ModuleBody = Schema.toStandardSchemaV1(
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
export type ModuleBody = typeof ModuleBody.Type;

const listenDataReport: ModuleEffect<ModuleInput, ModuleBody> = (
  query,
  request,
) =>
  Effect.gen(function* () {
    const response = yield* request(
      buildApiRequestIntent(
        `/api/content/activity/listen/data/report`,
        {
          type: query.type || 'week', //周 week 月 month 年 year
          endTime: query.endTime, // 不填就是本周/月的
        },
        createOption(query),
      ),
    );
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

export { decodeLegacyModuleInput as decodeModuleInput } from '../core/module-input.ts';

export type ModuleInput = LegacyModuleInput;
