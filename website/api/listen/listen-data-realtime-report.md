---
title: '听歌足迹 - 本周/本月收听时长'
description: '登录后调用此接口，获取本周/本月收听时长'
---

# 听歌足迹 - 本周/本月收听时长

登录后调用此接口，获取本周/本月收听时长

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                                                             |
| ---------- | ------------------------------------------------------------------------------ |
| 接口地址   | `/listen/data/realtime/report`                                                 |
| 请求方式   | `GET` / `POST`                                                                 |
| 需要登录   | 是                                                                             |
| 对应模块   | `listen_data_realtime_report`                                                  |
| SDK 函数   | `listenDataRealtimeReport`（`hana-music-api/api/listen_data_realtime_report`） |
| 返回体类型 | `ListenDataRealtimeReportBody`（已建模返回体）                                 |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { listenDataRealtimeReport } from 'hana-music-api';

const result = await listenDataRealtimeReport(
  {
    type: 'month',
  },
  { cookie: 'MUSIC_U=your-cookie' },
);
console.log(result.body);
```

### HTTP

```bash
curl --get 'http://127.0.0.1:3021/listen/data/realtime/report' \
  -H 'Cookie: MUSIC_U=your-cookie' \
  --data-urlencode 'type=month'
```

<!-- api-doc:params:start -->

## 请求参数

| 参数   | 类型                | 必填 | 默认值 | 说明                                                    |
| ------ | ------------------- | ---- | ------ | ------------------------------------------------------- |
| `type` | `'week' \| 'month'` | 否   | `week` | 维度类型 周 week 月 month; 今年没结束，不支持今年的数据 |

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

返回体类型：`ListenDataRealtimeReportBody`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/listen_data_realtime_report`、`hana-music-api/schemas/listen_data_realtime_report` 导入运行时校验器）。

```ts
type DurationDetail = {
  audiobookDuration?: number | null;
  duration?: number | null;
  period?: string | null;
  podcastDuration?: number | null;
  reachLimit?: boolean | null;
};

type SleepBlock = {
  avgDayPlayDuration?: number | null;
  sleepDurationDetails?: Array<DurationDetail> | null;
  sleepListenDays?: number | null;
  sleepPlayDuration?: number | null;
};

type DistributionBlock = {
  blockType?: string | null;
  durationDetails?: Array<DurationDetail> | null;
  listenDays?: number | null;
  playDuration?: number | null;
  sleepTdBlock?: SleepBlock | null;
};

type FriendRecord = {
  artistId?: number | null;
  artistName?: string | null;
  artistPicUrl?: string | null;
  collect?: boolean | null;
  latestListenTime?: number | null;
  songId?: number | null;
  songName?: string | null;
  songPicUrl?: string | null;
  userAvatar?: string | null;
  userId?: number | null;
  username?: string | null;
};

type FriendsBlock = {
  friendListenRecords?: Array<FriendRecord> | null;
};

type TodayBlock = {
  coverUrls?: Array<string> | null;
  redCount?: number | null;
  songCount?: number | null;
};

type ListenDataRealtimeReportBody = {
  code: 200;
  data: {
    endTime?: number | null;
    listenTimeDistributionBlock?: DistributionBlock | null;
    startTime?: number | null;
    type?: string | null;
    weekFriendsListenBlock?: FriendsBlock | null;
    weekTodayListenBlock?: TodayBlock | null;
  };
  message?: string | null;
};
```

| 字段                                               | 类型                    | 必填 | 说明                         |
| -------------------------------------------------- | ----------------------- | ---- | ---------------------------- |
| `code`                                             | `200`                   | 是   | 业务状态码（`200` 表示成功） |
| `data`                                             | `object`                | 是   | 接口返回的数据主体           |
| `data.endTime`                                     | `number`                | 否   | 时间戳                       |
| `data.listenTimeDistributionBlock`                 | `DistributionBlock`     | 否   | -                            |
| `data.listenTimeDistributionBlock.blockType`       | `string`                | 否   | -                            |
| `data.listenTimeDistributionBlock.durationDetails` | `Array<DurationDetail>` | 否   | -                            |
| `data.listenTimeDistributionBlock.listenDays`      | `number`                | 否   | -                            |
| `data.listenTimeDistributionBlock.playDuration`    | `number`                | 否   | -                            |
| `data.listenTimeDistributionBlock.sleepTdBlock`    | `SleepBlock`            | 否   | -                            |
| `data.startTime`                                   | `number`                | 否   | 时间戳                       |
| `data.type`                                        | `string`                | 否   | -                            |
| `data.weekFriendsListenBlock`                      | `FriendsBlock`          | 否   | -                            |
| `data.weekFriendsListenBlock.friendListenRecords`  | `Array<FriendRecord>`   | 否   | -                            |
| `data.weekTodayListenBlock`                        | `TodayBlock`            | 否   | -                            |
| `data.weekTodayListenBlock.coverUrls`              | `Array<string>`         | 否   | -                            |
| `data.weekTodayListenBlock.redCount`               | `number`                | 否   | -                            |
| `data.weekTodayListenBlock.songCount`              | `number`                | 否   | -                            |
| `message`                                          | `string`                | 否   | 返回说明信息                 |

<!-- api-doc:response:end -->

## 注意事项

- **年份限制**：若当年尚未结束，暂不支持查询当年实时统计数据。
