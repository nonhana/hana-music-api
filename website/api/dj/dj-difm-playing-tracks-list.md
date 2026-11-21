---
title: 'DIFM电台 - 播放列表'
description: '调用此接口，获取DIFM播放列表'
---

# DIFM电台 - 播放列表

调用此接口，获取DIFM播放列表

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                                                            |
| ---------- | ----------------------------------------------------------------------------- |
| 接口地址   | `/dj/difm/playing/tracks/list`                                                |
| 请求方式   | `GET` / `POST`                                                                |
| 需要登录   | 否                                                                            |
| 对应模块   | `dj_difm_playing_tracks_list`                                                 |
| SDK 函数   | `djDifmPlayingTracksList`（`hana-music-api/api/dj_difm_playing_tracks_list`） |
| 返回体类型 | `DjDifmPlayingTracksListBody`（已建模返回体）                                 |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { djDifmPlayingTracksList } from 'hana-music-api';

const result = await djDifmPlayingTracksList({
  source: 0,
  channelId: '1012',
});
console.log(result.body);
```

### HTTP

```bash
curl --get 'http://127.0.0.1:3021/dj/difm/playing/tracks/list' \
  --data-urlencode 'source=0' \
  --data-urlencode 'channelId=1012'
```

<!-- api-doc:params:start -->

## 请求参数

| 参数        | 类型               | 必填 | 默认值 | 说明                                      |
| ----------- | ------------------ | ---- | ------ | ----------------------------------------- |
| `channelId` | `number \| string` | 是   | -      | 频道id                                    |
| `limit`     | `number`           | 否   | `5`    | 返回数量，默认为 5                        |
| `source`    | `0 \| 1 \| 2`      | 否   | `0`    | 来源，0: 最嗨电音 1: 古典电台 2: 爵士电台 |

| `source` | 来源             |
| -------- | ---------------- |
| `0`      | 最嗨电音（默认） |
| `1`      | 古典电台         |
| `2`      | 爵士电台         |

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

返回体类型：`DjDifmPlayingTracksListBody`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/dj_difm_playing_tracks_list`、`hana-music-api/schemas/dj_difm_playing_tracks_list` 导入运行时校验器）。

```ts
type Track = {
  id: number;
  artist?: string | null;
  audio?: string | null;
  blurCover?: string | null;
  channelId?: number | null;
  cover?: string | null;
  duration?: number | null;
  name?: string | null;
  offset?: number | null;
  source?: number | null;
  wave?: Array<number> | null;
};

type DjDifmPlayingTracksListBody = {
  code: 200;
  data: {
    list: Array<Track>;
    total?: number | null;
  };
  message?: string | null;
};
```

| 字段                    | 类型            | 必填 | 说明                         |
| ----------------------- | --------------- | ---- | ---------------------------- |
| `code`                  | `200`           | 是   | 业务状态码（`200` 表示成功） |
| `data`                  | `object`        | 是   | 接口返回的数据主体           |
| `data.list`             | `Array<Track>`  | 是   | 结果条目列表                 |
| `data.list[].id`        | `number`        | 是   | 记录 ID                      |
| `data.list[].artist`    | `string`        | 否   | 歌手详情                     |
| `data.list[].audio`     | `string`        | 否   | -                            |
| `data.list[].blurCover` | `string`        | 否   | -                            |
| `data.list[].channelId` | `number`        | 否   | channel ID                   |
| `data.list[].cover`     | `string`        | 否   | 封面图片 URL                 |
| `data.list[].duration`  | `number`        | 否   | 时长（毫秒）                 |
| `data.list[].name`      | `string`        | 否   | 名称                         |
| `data.list[].offset`    | `number`        | 否   | -                            |
| `data.list[].source`    | `number`        | 否   | -                            |
| `data.list[].wave`      | `Array<number>` | 否   | -                            |
| `data.total`            | `number`        | 否   | 总条目数                     |
| `message`               | `string`        | 否   | 返回说明信息                 |

<!-- api-doc:response:end -->
