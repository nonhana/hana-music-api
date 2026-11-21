---
title: '听歌足迹 - 周/月/年收听报告'
description: '登录后调用此接口，获取周/月/年收听报告'
---

# 听歌足迹 - 周/月/年收听报告

登录后调用此接口，获取周/月/年收听报告

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                                            |
| ---------- | ------------------------------------------------------------- |
| 接口地址   | `/listen/data/report`                                         |
| 请求方式   | `GET` / `POST`                                                |
| 需要登录   | 是                                                            |
| 对应模块   | `listen_data_report`                                          |
| SDK 函数   | `listenDataReport`（`hana-music-api/api/listen_data_report`） |
| 返回体类型 | `ListenDataReportBody`（已建模返回体）                        |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { listenDataReport } from 'hana-music-api';

const result = await listenDataReport(
  {
    type: 'month',
  },
  { cookie: 'MUSIC_U=your-cookie' },
);
console.log(result.body);
```

### HTTP

```bash
curl --get 'http://127.0.0.1:3021/listen/data/report' \
  -H 'Cookie: MUSIC_U=your-cookie' \
  --data-urlencode 'type=month'
```

<!-- api-doc:params:start -->

## 请求参数

| 参数      | 类型                          | 必填 | 默认值 | 说明                                                                                                                               |
| --------- | ----------------------------- | ---- | ------ | ---------------------------------------------------------------------------------------------------------------------------------- |
| `endTime` | `number`                      | 否   | -      | 周: 每周周六0点的时间戳 月: 每月最后一天0点的时间戳 年: 每年最后一天0点的时间戳<br>不填就是本周/月的，今年没结束，则没有今年的数据 |
| `type`    | `'week' \| 'month' \| 'year'` | 否   | `week` | 维度类型 周 week 月 month 年 year                                                                                                  |

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

返回体类型：`ListenDataReportBody`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/listen_data_report`、`hana-music-api/schemas/listen_data_report` 导入运行时校验器）。

```ts
type FriendKeywordBlock = {
  blockType?: string | null;
  items?: Array<{
    enumCode?: string | null;
    friendList?: Array<{
      userAvatar?: string | null;
      userId?: number | null;
      username?: string | null;
    }> | null;
    friendsKeywordEnum?: string | null;
    subTitle?: string | null;
    title?: string | null;
  }> | null;
};

type FriendListenBlock = {
  blockType?: string | null;
  items?: Array<{
    collect?: boolean | null;
    playCount?: number | null;
    songId?: number | null;
    songName?: string | null;
    songPicUrl?: string | null;
    userAvatar?: string | null;
    userId?: number | null;
    username?: string | null;
  }> | null;
};

type ListenTimeBlock = {
  blockType?: string | null;
  circleTimePeriodDurations?: Array<{
    duration?: number | null;
    period?: string | null;
  }> | null;
  playDuration?: number | null;
  playDurationText?: string | null;
  sections?: Array<{
    field?: string | null;
    textB?: string | null;
    type?: string | null;
    valueA?: string | null;
  }> | null;
};

type DurationDetail = {
  audiobookDuration?: number | null;
  duration?: number | null;
  period?: string | null;
  podcastDuration?: number | null;
  reachLimit?: boolean | null;
};

type TimeDistributionBlock = {
  achievementTitle?: {
    mainTitle?: string | null;
    subTitle?: string | null;
  } | null;
  blockType?: string | null;
  durationDetails?: Array<DurationDetail> | null;
  listenDays?: number | null;
  playDuration?: number | null;
  sections?: Array<{
    type?: string | null;
    value?: string | null;
  }> | null;
};

type TopAgeBlock = {
  age?: string | null;
  blockType?: string | null;
  picUrl?: string | null;
  sections?: Array<{
    age?: string | null;
    playSongNum?: number | null;
  }> | null;
  songId?: number | null;
  songItems?: Array<{
    picUrl?: string | null;
    songId?: number | null;
    songName?: string | null;
    text?: string | null;
  }> | null;
  songName?: string | null;
  text?: string | null;
};

type TopArtistBlock = {
  artisId?: number | null;
  artistName?: string | null;
  avatarUrl?: string | null;
  blockType?: string | null;
  items?: Array<{
    field?: string | null;
    mainText?: string | null;
    resourceId?: string | null;
    subText?: string | null;
    type?: string | null;
  }> | null;
  playCount?: number | null;
  sections?: Array<{
    artistId?: number | null;
    artistName?: string | null;
    field?: string | null;
    picUrl?: string | null;
    text?: string | null;
    type?: string | null;
  }> | null;
};

type TopLanguageBlock = {
  blockType?: string | null;
  picUrl?: string | null;
  sections?: Array<{
    language?: string | null;
    percent?: string | null;
    playSongNum?: number | null;
    songName?: string | null;
  }> | null;
  songId?: number | null;
  songItems?: Array<{
    picUrl?: string | null;
    songId?: number | null;
    songName?: string | null;
    text?: string | null;
  }> | null;
  songName?: string | null;
};

type TopSongBlock = {
  artists?: Array<{
    artistId?: number | null;
    artistName?: string | null;
  }> | null;
  blockType?: string | null;
  items?: Array<{
    field?: string | null;
    mainText?: string | null;
    subText?: string | null;
    type?: string | null;
  }> | null;
  picUrl?: string | null;
  playCount?: number | null;
  sections?: Array<{
    field?: string | null;
    picUrl?: string | null;
    songId?: number | null;
    songName?: string | null;
    text?: string | null;
    type?: string | null;
  }> | null;
  songId?: number | null;
  songName?: string | null;
};

type TopStyleBlock = {
  blockType?: string | null;
  genreEnglishName?: string | null;
  genreId?: number | null;
  genreName?: string | null;
  items?: Array<{
    field?: string | null;
    mainText?: string | null;
    resourceId?: string | null;
    subText?: string | null;
    type?: string | null;
  }> | null;
  picUrl?: string | null;
  secondGenreEnglishName?: string | null;
  secondGenreId?: number | null;
  secondGenreName?: string | null;
  sections?: Array<{
    genreId?: number | null;
    genreName?: string | null;
    percent?: string | null;
  }> | null;
  songId?: number | null;
  songName?: string | null;
};

type VipBlock = {
  blockType?: string | null;
  picUrl?: string | null;
  sections?: Array<{
    field?: string | null;
    mainText?: string | null;
    subText?: string | null;
    type?: string | null;
  }> | null;
  songId?: number | null;
  songName?: string | null;
};

type WallpaperBlock = {
  blockType?: string | null;
  items?: Array<{
    artists?: Array<{
      artistId?: number | null;
      artistName?: string | null;
    }> | null;
    picId?: number | null;
    picUrl?: string | null;
    songId?: number | null;
    songName?: string | null;
  }> | null;
  picUrls?: Array<string> | null;
  songCount?: number | null;
};

type ListenDataReportBody = {
  code: 200;
  data: {
    endTime?: number | null;
    friendsKeyWordMonthBlock?: FriendKeywordBlock | null;
    friendsKeywordWeekBlock?: FriendKeywordBlock | null;
    friendsListenMonthBlock?: FriendListenBlock | null;
    friendsListenWeekBlock?: FriendListenBlock | null;
    listenTimeBlock?: ListenTimeBlock | null;
    listenTimeDistributionBlock?: TimeDistributionBlock | null;
    startTime?: number | null;
    topAgeBlock?: TopAgeBlock | null;
    topArtistBlock?: TopArtistBlock | null;
    topLanguageBlock?: TopLanguageBlock | null;
    topSongBlock?: TopSongBlock | null;
    topStyleBlock?: TopStyleBlock | null;
    type?: string | null;
    vipBlock?: VipBlock | null;
    wallpaperBlock?: WallpaperBlock | null;
  };
  message?: string | null;
};
```

| 字段      | 类型     | 必填 | 说明                         |
| --------- | -------- | ---- | ---------------------------- |
| `code`    | `200`    | 是   | 业务状态码（`200` 表示成功） |
| `data`    | `object` | 是   | 接口返回的数据主体           |
| `message` | `string` | 否   | 返回说明信息                 |

<!-- api-doc:response:end -->

## 注意事项

- **年份限制**：若当年尚未结束，暂不支持查询当年全年统计数据。
