---
title: '回忆坐标'
description: '可以获取当前歌曲的回忆坐标信息 (见手机 APP 百科页的回忆坐标功能)'
---

# 回忆坐标

可以获取当前歌曲的回忆坐标信息 (见手机 APP 百科页的回忆坐标功能)

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                                                     |
| ---------- | ---------------------------------------------------------------------- |
| 接口地址   | `/music/first/listen/info`                                             |
| 请求方式   | `GET` / `POST`                                                         |
| 需要登录   | 否                                                                     |
| 对应模块   | `music_first_listen_info`                                              |
| SDK 函数   | `musicFirstListenInfo`（`hana-music-api/api/music_first_listen_info`） |
| 返回体类型 | `MusicFirstListenInfoBody`（已建模返回体）                             |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { musicFirstListenInfo } from 'hana-music-api';

const result = await musicFirstListenInfo({
  id: 347230,
});
console.log(result.body);
```

### HTTP

```bash
curl --get 'http://127.0.0.1:3021/music/first/listen/info' \
  --data-urlencode 'id=347230'
```

<!-- api-doc:params:start -->

## 请求参数

| 参数 | 类型               | 必填 | 默认值 | 说明        |
| ---- | ------------------ | ---- | ------ | ----------- |
| `id` | `number \| string` | 否   | -      | 目标资源 ID |

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

返回体类型：`MusicFirstListenInfoBody`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/music_first_listen_info`、`hana-music-api/schemas/music_first_listen_info` 导入运行时校验器）。

```ts
type FirstListenSongInfo = {
  songId: number;
  songName?: string | null;
  singer?: string | null;
  pubTime?: number | null;
  coverUrl?: string | null;
  type?: number | null;
};

type FirstListenInfo = {
  date: string;
  season?: string | null;
  period?: string | null;
  time?: string | null;
  meetDuration?: string | null;
  meetDurationDesc?: string | null;
  listenTime?: number | null;
};

type TotalPlayInfo = {
  playCount?: number | null;
  duration?: number | null;
  text?: string | null;
};

type LikeSongInfo = {
  text?: string | null;
  like?: boolean | null;
  collect?: boolean | null;
  redTime?: string | null;
  redDesc?: string | null;
  redTimeStamp?: number | null;
};

type MusicFirstListenInfoBody =
  | {
      code: 200;
      data: {
        songInfoDto?: FirstListenSongInfo | null;
        musicFirstListenDto?: FirstListenInfo | null;
        musicTotalPlayDto?: TotalPlayInfo | null;
        musicLikeSongDto?: LikeSongInfo | null;
      };
      message?: string | null;
    }
  | '';
```

> 标为`可空`的路径在缺失或为 `null` 时正常返回，存在时按内部结构校验。

| 字段                                        | 类型                  | 必填 | 说明                         |
| ------------------------------------------- | --------------------- | ---- | ---------------------------- |
| `code`                                      | `200`                 | 是   | 业务状态码（`200` 表示成功） |
| `data`                                      | `object`              | 是   | 接口返回的数据主体           |
| `data.songInfoDto`                          | `FirstListenSongInfo` | 可空 | -                            |
| `data.songInfoDto.songId`                   | `number`              | 是   | 歌曲 ID                      |
| `data.songInfoDto.songName`                 | `string`              | 否   | -                            |
| `data.songInfoDto.singer`                   | `string`              | 否   | -                            |
| `data.songInfoDto.pubTime`                  | `number`              | 否   | 时间戳                       |
| `data.songInfoDto.coverUrl`                 | `string`              | 否   | 资源访问链接                 |
| `data.songInfoDto.type`                     | `number`              | 否   | -                            |
| `data.musicFirstListenDto`                  | `FirstListenInfo`     | 可空 | -                            |
| `data.musicFirstListenDto.date`             | `string`              | 是   | -                            |
| `data.musicFirstListenDto.season`           | `string`              | 否   | -                            |
| `data.musicFirstListenDto.period`           | `string`              | 否   | -                            |
| `data.musicFirstListenDto.time`             | `string`              | 否   | 时间戳                       |
| `data.musicFirstListenDto.meetDuration`     | `string`              | 否   | -                            |
| `data.musicFirstListenDto.meetDurationDesc` | `string`              | 否   | -                            |
| `data.musicFirstListenDto.listenTime`       | `number`              | 否   | 时间戳                       |
| `data.musicTotalPlayDto`                    | `TotalPlayInfo`       | 可空 | -                            |
| `data.musicTotalPlayDto.playCount`          | `number`              | 否   | 播放次数                     |
| `data.musicTotalPlayDto.duration`           | `number`              | 否   | 时长（毫秒）                 |
| `data.musicTotalPlayDto.text`               | `string`              | 否   | -                            |
| `data.musicLikeSongDto`                     | `LikeSongInfo`        | 可空 | -                            |
| `data.musicLikeSongDto.text`                | `string`              | 否   | -                            |
| `data.musicLikeSongDto.like`                | `boolean`             | 否   | -                            |
| `data.musicLikeSongDto.collect`             | `boolean`             | 否   | -                            |
| `data.musicLikeSongDto.redTime`             | `string`              | 否   | 时间戳                       |
| `data.musicLikeSongDto.redDesc`             | `string`              | 否   | -                            |
| `data.musicLikeSongDto.redTimeStamp`        | `number`              | 否   | -                            |
| `message`                                   | `string`              | 否   | 返回说明信息                 |

> 当参数格式异常时，上游可能返回空响应，此时返回体为 `""`。

<!-- api-doc:response:end -->
