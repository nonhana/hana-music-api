---
title: '黑胶时光机'
description: '调用此接口，可获得黑胶时光机数据'
---

# 黑胶时光机

调用此接口，可获得黑胶时光机数据

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                                       |
| ---------- | -------------------------------------------------------- |
| 接口地址   | `/vip/timemachine`                                       |
| 请求方式   | `GET` / `POST`                                           |
| 需要登录   | 否                                                       |
| 对应模块   | `vip_timemachine`                                        |
| SDK 函数   | `vipTimemachine`（`hana-music-api/api/vip_timemachine`） |
| 返回体类型 | `VipTimemachineBody`（已建模返回体）                     |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { vipTimemachine } from 'hana-music-api';

const result = await vipTimemachine({
  startTime: 1,
});
console.log(result.body);
```

### HTTP

```bash
curl --get 'http://127.0.0.1:3021/vip/timemachine' \
  --data-urlencode 'startTime=1'
```

<!-- api-doc:params:start -->

## 请求参数

| 参数        | 类型     | 必填 | 默认值 | 说明                |
| ----------- | -------- | ---- | ------ | ------------------- |
| `startTime` | `number` | 否   | -      | 开始时间            |
| `endTime`   | `number` | 否   | -      | 结束时间            |
| `limit`     | `number` | 否   | `60`   | 返回数量，默认为 60 |

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

返回体类型：`VipTimemachineBody`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/vip_timemachine`、`hana-music-api/schemas/vip_timemachine` 导入运行时校验器）。

```ts
type DurationItem = {
  count?: number | null;
  duration?: number | null;
  intervel?: number | null;
  intervelType?: number | null;
  playCntRate?: string | null;
};

type DayDetail = {
  day?: number | null;
  duration?: number | null;
};

type SongInfo = {
  songId?: number | null;
  songName?: string | null;
  count?: number | null;
  mainArtistName?: string | null;
  artistNames?: string | null;
  online?: boolean | null;
  songStype?: Array<string> | null;
  coverUrl?: string | null;
  artistMap?: Record<string, string> | null;
  albumName?: string | null;
  tag?: string | null;
};

type TimemachineAlbumInfo = {
  count?: number | null;
  details?: Array<{
    albumId?: number | null;
    albumName?: string | null;
    coverUrl?: string | null;
    online?: boolean | null;
    playerId?: number | null;
    playerName?: string | null;
    tag?: string | null;
  }> | null;
};

type CommonStyle = {
  styleDetailList?: Array<{
    percent?: string | null;
    styleName?: string | null;
  }> | null;
};

type Player = {
  id?: number | null;
  artistName?: string | null;
  aliasName?: string | null;
  cover?: string | null;
  hasRelation?: boolean | null;
  fansCount?: number | null;
  fansShow?: string | null;
  userId?: number | null;
  tag?: string | null;
};

type PlayerList = {
  count?: number | null;
  players?: Array<Player> | null;
};

type SingleList = {
  count?: number | null;
  singles?: Array<SongInfo> | null;
};

type MusicEmotion = {
  emotions?: Array<{
    type?: number | null;
    detail?: Array<{
      day?: number | null;
      percent?: string | null;
    }> | null;
  }> | null;
  subTitle?: Array<string> | null;
};

type MusicYear = {
  percent?: string | null;
  total?: number | null;
  year?: number | null;
  yearPercents?: Array<{
    endYear?: number | null;
    percent?: string | null;
    startYear?: number | null;
  }> | null;
  yearSingles?: Array<SongInfo> | null;
};

type RecommendPlayList = {
  count?: number | null;
  cover?: string | null;
  id?: number | null;
  name?: string | null;
  playCountShow?: string | null;
};

type SecondStyle = {
  name?: string | null;
  secondStyleId?: number | null;
  song?: SongInfo | null;
};

type TimemachineData = {
  appDurationDataList?: Array<DurationItem> | null;
  details?: Array<DayDetail> | null;
  endSong?: SongInfo | null;
  endTime?: number | null;
  intervelCount?: number | null;
  intervelDurationDataList?: Array<DurationItem> | null;
  intervelType?: number | null;
  keyword?: string | null;
  listenAlbum?: number | null;
  listenAlbumInfo?: TimemachineAlbumInfo | null;
  listenCommonStyle?: CommonStyle | null;
  listenPlayer?: PlayerList | null;
  listenPlayerSong?: number | null;
  listenSingle?: SingleList | null;
  listenSongs?: number | null;
  listenStyleSongs?: number | null;
  listenTime?: number | null;
  listenWeekCount?: number | null;
  listenWeekTime?: number | null;
  musicEmotion?: MusicEmotion | null;
  musicYear?: MusicYear | null;
  newStyleName?: string | null;
  percent?: string | null;
  player?: Player | null;
  recommendPlayList?: Array<RecommendPlayList> | null;
  recommendPlayers?: Array<Player> | null;
  recommendSongs?: Array<SongInfo> | null;
  secondStyleDataList?: Array<SecondStyle> | null;
  songInfos?: Array<SongInfo> | null;
  startSong?: SongInfo | null;
  startTime?: number | null;
  styleId?: number | null;
  styleName?: string | null;
  subTitle?: string | null;
  totalAlbum?: number | null;
  totalSong?: number | null;
  tsNum?: number | null;
  version?: number | null;
};

type TimemachineDetail = {
  rowKey: string;
  data: TimemachineData;
  dayTime?: number | null;
  next?: number | null;
  nextVersion?: number | null;
  prev?: number | null;
  preVersion?: number | null;
  showFree?: boolean | null;
  type?: number | null;
  userId?: number | null;
  weekEndTime?: number | null;
  weekStartTime?: number | null;
};

type VipTimemachineBody = {
  code: 200;
  data: {
    beta?: boolean | null;
    detail?: Array<TimemachineDetail> | null;
    hasnext?: boolean | null;
    notVipLimitNum?: number | null;
    recordTime?: number | null;
    showcashier?: boolean | null;
  };
  message?: string | null;
};
```

> 标为`可空`的路径在缺失或为 `null` 时正常返回，存在时按内部结构校验。

| 字段                          | 类型                       | 必填 | 说明                         |
| ----------------------------- | -------------------------- | ---- | ---------------------------- |
| `code`                        | `200`                      | 是   | 业务状态码（`200` 表示成功） |
| `data`                        | `object`                   | 是   | 接口返回的数据主体           |
| `data.beta`                   | `boolean`                  | 否   | -                            |
| `data.detail`                 | `Array<TimemachineDetail>` | 可空 | -                            |
| `data.detail[].rowKey`        | `string`                   | 是   | -                            |
| `data.detail[].data`          | `TimemachineData`          | 是   | 接口返回的数据主体           |
| `data.detail[].dayTime`       | `number`                   | 否   | 时间戳                       |
| `data.detail[].next`          | `number`                   | 否   | -                            |
| `data.detail[].nextVersion`   | `number`                   | 否   | -                            |
| `data.detail[].prev`          | `number`                   | 否   | -                            |
| `data.detail[].preVersion`    | `number`                   | 否   | -                            |
| `data.detail[].showFree`      | `boolean`                  | 否   | -                            |
| `data.detail[].type`          | `number`                   | 否   | -                            |
| `data.detail[].userId`        | `number`                   | 否   | 用户 ID                      |
| `data.detail[].weekEndTime`   | `number`                   | 否   | 时间戳                       |
| `data.detail[].weekStartTime` | `number`                   | 否   | 时间戳                       |
| `data.hasnext`                | `boolean`                  | 否   | -                            |
| `data.notVipLimitNum`         | `number`                   | 否   | -                            |
| `data.recordTime`             | `number`                   | 否   | 时间戳                       |
| `data.showcashier`            | `boolean`                  | 否   | -                            |
| `message`                     | `string`                   | 否   | 返回说明信息                 |

<!-- api-doc:response:end -->
