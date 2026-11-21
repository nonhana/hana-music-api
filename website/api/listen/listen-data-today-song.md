---
title: '听歌足迹 - 今日收听'
description: '登录后调用此接口，获取今日收听'
---

# 听歌足迹 - 今日收听

登录后调用此接口，获取今日收听

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                                                   |
| ---------- | -------------------------------------------------------------------- |
| 接口地址   | `/listen/data/today/song`                                            |
| 请求方式   | `GET` / `POST`                                                       |
| 需要登录   | 是                                                                   |
| 对应模块   | `listen_data_today_song`                                             |
| SDK 函数   | `listenDataTodaySong`（`hana-music-api/api/listen_data_today_song`） |
| 返回体类型 | `ListenDataTodaySongBody`（已建模返回体）                            |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { listenDataTodaySong } from 'hana-music-api';

const result = await listenDataTodaySong({}, { cookie: 'MUSIC_U=your-cookie' });
console.log(result.body);
```

### HTTP

```bash
curl 'http://127.0.0.1:3021/listen/data/today/song' \
  -H 'Cookie: MUSIC_U=your-cookie'
```

<!-- api-doc:params:start -->

## 请求参数

无业务参数。

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

返回体类型：`ListenDataTodaySongBody`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/listen_data_today_song`、`hana-music-api/schemas/listen_data_today_song` 导入运行时校验器）。

```ts
type TodaySong = {
  aliasName?: string | null;
  artists?: Array<{
    artistId?: number | null;
    artistName?: string | null;
  }> | null;
  lastPlayTime?: number | null;
  picId?: number | null;
  picUrl?: string | null;
  redStar?: boolean | null;
  songId: number;
  songName?: string | null;
};

type ListenDataTodaySongBody = {
  code: 200;
  data: {
    songDTOs: Array<TodaySong>;
  };
  message?: string | null;
};
```

| 字段                           | 类型               | 必填 | 说明                         |
| ------------------------------ | ------------------ | ---- | ---------------------------- |
| `code`                         | `200`              | 是   | 业务状态码（`200` 表示成功） |
| `data`                         | `object`           | 是   | 接口返回的数据主体           |
| `data.songDTOs`                | `Array<TodaySong>` | 是   | -                            |
| `data.songDTOs[].aliasName`    | `string`           | 否   | -                            |
| `data.songDTOs[].artists`      | `Array<object>`    | 否   | 歌手列表                     |
| `data.songDTOs[].lastPlayTime` | `number`           | 否   | 时间戳                       |
| `data.songDTOs[].picId`        | `number`           | 否   | pic ID                       |
| `data.songDTOs[].picUrl`       | `string`           | 否   | 资源访问链接                 |
| `data.songDTOs[].redStar`      | `boolean`          | 否   | -                            |
| `data.songDTOs[].songId`       | `number`           | 是   | 歌曲 ID                      |
| `data.songDTOs[].songName`     | `string`           | 否   | -                            |
| `message`                      | `string`           | 否   | 返回说明信息                 |

<!-- api-doc:response:end -->
