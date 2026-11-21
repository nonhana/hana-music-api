---
title: '音乐人播放趋势'
description: '音乐人登录后调用此接口，可获取歌曲播放趋势'
---

# 音乐人播放趋势

音乐人登录后调用此接口，可获取歌曲播放趋势

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                                              |
| ---------- | --------------------------------------------------------------- |
| 接口地址   | `/musician/play/trend`                                          |
| 请求方式   | `GET` / `POST`                                                  |
| 需要登录   | 是                                                              |
| 对应模块   | `musician_play_trend`                                           |
| SDK 函数   | `musicianPlayTrend`（`hana-music-api/api/musician_play_trend`） |
| 返回体类型 | `MusicianPlayTrendBody`（已建模返回体）                         |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { musicianPlayTrend } from 'hana-music-api';

const result = await musicianPlayTrend(
  {
    startTime: '2021-05-24',
    endTime: '2021-05-30',
  },
  { cookie: 'MUSIC_U=your-cookie' },
);
console.log(result.body);
```

### HTTP

```bash
curl --get 'http://127.0.0.1:3021/musician/play/trend' \
  -H 'Cookie: MUSIC_U=your-cookie' \
  --data-urlencode 'startTime=2021-05-24' \
  --data-urlencode 'endTime=2021-05-30'
```

<!-- api-doc:params:start -->

## 请求参数

| 参数        | 类型     | 必填 | 默认值 | 说明     |
| ----------- | -------- | ---- | ------ | -------- |
| `startTime` | `string` | 是   | -      | 开始时间 |
| `endTime`   | `string` | 是   | -      | 结束时间 |

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

返回体类型：`MusicianPlayTrendBody`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/musician_play_trend`、`hana-music-api/schemas/musician_play_trend` 导入运行时校验器）。

```ts
type PlayTrendPoint = {
  dateTime: string;
  dataValue: string;
};

type MusicianPlayTrendBody = {
  code: 200;
  data: Array<PlayTrendPoint>;
  message?: string | null;
};
```

| 字段               | 类型                    | 必填 | 说明                         |
| ------------------ | ----------------------- | ---- | ---------------------------- |
| `code`             | `200`                   | 是   | 业务状态码（`200` 表示成功） |
| `data`             | `Array<PlayTrendPoint>` | 是   | 接口返回的数据主体           |
| `data[].dateTime`  | `string`                | 是   | 时间戳                       |
| `data[].dataValue` | `string`                | 是   | -                            |
| `message`          | `string`                | 否   | 返回说明信息                 |

<!-- api-doc:response:end -->
