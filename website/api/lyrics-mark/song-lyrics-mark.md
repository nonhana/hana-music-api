---
title: '歌词摘录 - 歌词摘录信息'
description: '登录后调用此接口，传入歌曲id，获取歌词摘录信息'
---

# 歌词摘录 - 歌词摘录信息

登录后调用此接口，传入歌曲id，获取歌词摘录信息

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                                        |
| ---------- | --------------------------------------------------------- |
| 接口地址   | `/song/lyrics/mark`                                       |
| 请求方式   | `GET` / `POST`                                            |
| 需要登录   | 是                                                        |
| 对应模块   | `song_lyrics_mark`                                        |
| SDK 函数   | `songLyricsMark`（`hana-music-api/api/song_lyrics_mark`） |
| 返回体类型 | `SongLyricsMarkBody`（已建模返回体）                      |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { songLyricsMark } from 'hana-music-api';

const result = await songLyricsMark(
  {
    id: '2058263032',
  },
  { cookie: 'MUSIC_U=your-cookie' },
);
console.log(result.body);
```

### HTTP

```bash
curl --get 'http://127.0.0.1:3021/song/lyrics/mark' \
  -H 'Cookie: MUSIC_U=your-cookie' \
  --data-urlencode 'id=2058263032'
```

<!-- api-doc:params:start -->

## 请求参数

| 参数 | 类型               | 必填 | 默认值 | 说明   |
| ---- | ------------------ | ---- | ------ | ------ |
| `id` | `number \| string` | 是   | -      | 歌曲id |

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

返回体类型：`SongLyricsMarkBody`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/song_lyrics_mark`、`hana-music-api/schemas/song_lyrics_mark` 导入运行时校验器）。

```ts
type SongLyricsMarkBody = {
  code: 200;
  data: Record<string, UnknownJson>;
  message?: string | null;
};
```

| 字段      | 类型                          | 必填 | 说明                         |
| --------- | ----------------------------- | ---- | ---------------------------- |
| `code`    | `200`                         | 是   | 业务状态码（`200` 表示成功） |
| `data`    | `Record<string, UnknownJson>` | 是   | 接口返回的数据主体           |
| `message` | `string`                      | 否   | 返回说明信息                 |

<!-- api-doc:response:end -->
