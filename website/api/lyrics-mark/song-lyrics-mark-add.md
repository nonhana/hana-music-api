---
title: '歌词摘录 - 添加/修改摘录歌词'
description: '登录后调用此接口，传入歌曲id，可以添加/修改摘录歌词'
---

# 歌词摘录 - 添加/修改摘录歌词

登录后调用此接口，传入歌曲id，可以添加/修改摘录歌词

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                                               |
| ---------- | ---------------------------------------------------------------- |
| 接口地址   | `/song/lyrics/mark/add`                                          |
| 请求方式   | `GET` / `POST`                                                   |
| 需要登录   | 是                                                               |
| 对应模块   | `song_lyrics_mark_add`                                           |
| SDK 函数   | `songLyricsMarkAdd`（`hana-music-api/api/song_lyrics_mark_add`） |
| 返回体类型 | `SongLyricsMarkAddBody`（已建模返回体）                          |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { songLyricsMarkAdd } from 'hana-music-api';

const result = await songLyricsMarkAdd(
  {
    id: 347230,
  },
  { cookie: 'MUSIC_U=your-cookie' },
);
console.log(result.body);
```

### HTTP

```bash
curl --get 'http://127.0.0.1:3021/song/lyrics/mark/add' \
  -H 'Cookie: MUSIC_U=your-cookie' \
  --data-urlencode 'id=347230'
```

<!-- api-doc:params:start -->

## 请求参数

| 参数     | 类型                | 必填 | 默认值 | 说明                                        |
| -------- | ------------------- | ---- | ------ | ------------------------------------------- |
| `id`     | `number \| string`  | 是   | -      | 歌曲 ID                                     |
| `markId` | `number \| string`  | 否   | ``     | 已有摘录 ID（修改摘录时传入，新增时可省略） |
| `marks`  | `Array<LyricsMark>` | 否   | -      | 歌词摘录条目数组，详见下方结构表            |

| `marks[]` 字段        | 类型     | 必填 | 说明                   |
| --------------------- | -------- | ---- | ---------------------- |
| `originalLyricsText`  | `string` | 是   | 原文歌词文本           |
| `startTimeStamp`      | `number` | 是   | 歌词起始时间戳（毫秒） |
| `translateLyricsText` | `string` | 是   | 译文歌词文本           |
| `translateType`       | `number` | 是   | 翻译类型标识           |

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

返回体类型：`SongLyricsMarkAddBody`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/song_lyrics_mark_add`、`hana-music-api/schemas/song_lyrics_mark_add` 导入运行时校验器）。

```ts
type LyricsMarkResult = {
  markId: number;
  success?: boolean | null;
  updateTime?: number | null;
};

type SongLyricsMarkAddBody = {
  code: 200;
  data: LyricsMarkResult;
  message?: string | null;
};
```

| 字段              | 类型               | 必填 | 说明                         |
| ----------------- | ------------------ | ---- | ---------------------------- |
| `code`            | `200`              | 是   | 业务状态码（`200` 表示成功） |
| `data`            | `LyricsMarkResult` | 是   | 接口返回的数据主体           |
| `data.markId`     | `number`           | 是   | mark ID                      |
| `data.success`    | `boolean`          | 否   | 操作是否成功                 |
| `data.updateTime` | `number`           | 否   | 时间戳                       |
| `message`         | `string`           | 否   | 返回说明信息                 |

<!-- api-doc:response:end -->
