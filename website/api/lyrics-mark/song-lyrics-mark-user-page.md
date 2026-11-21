---
title: '歌词摘录 - 我的歌词本'
description: '登录后调用此接口，获取我的歌词本'
---

# 歌词摘录 - 我的歌词本

登录后调用此接口，获取我的歌词本

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                                                          |
| ---------- | --------------------------------------------------------------------------- |
| 接口地址   | `/song/lyrics/mark/user/page`                                               |
| 请求方式   | `GET` / `POST`                                                              |
| 需要登录   | 是                                                                          |
| 对应模块   | `song_lyrics_mark_user_page`                                                |
| SDK 函数   | `songLyricsMarkUserPage`（`hana-music-api/api/song_lyrics_mark_user_page`） |
| 返回体类型 | `SongLyricsMarkUserPageBody`（已建模返回体）                                |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { songLyricsMarkUserPage } from 'hana-music-api';

const result = await songLyricsMarkUserPage(
  {
    limit: 30,
  },
  { cookie: 'MUSIC_U=your-cookie' },
);
console.log(result.body);
```

### HTTP

```bash
curl --get 'http://127.0.0.1:3021/song/lyrics/mark/user/page' \
  -H 'Cookie: MUSIC_U=your-cookie' \
  --data-urlencode 'limit=30'
```

<!-- api-doc:params:start -->

## 请求参数

| 参数     | 类型     | 必填 | 默认值 | 说明                                                                     |
| -------- | -------- | ---- | ------ | ------------------------------------------------------------------------ |
| `limit`  | `number` | 否   | `10`   | 返回数量，默认为 20                                                      |
| `offset` | `number` | 否   | `0`    | 偏移数量，用于分页 ，如：(页数 - 1)\*30，其中 30 为 limit 的值，默认为 0 |

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

返回体类型：`SongLyricsMarkUserPageBody`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/song_lyrics_mark_user_page`、`hana-music-api/schemas/song_lyrics_mark_user_page` 导入运行时校验器）。

```ts
type SongLyricsMarkUserPageBody = {
  code: 200;
  data: {
    hasMore?: boolean | null;
    offset?: number | null;
  };
  message?: string | null;
};
```

| 字段           | 类型      | 必填 | 说明                         |
| -------------- | --------- | ---- | ---------------------------- |
| `code`         | `200`     | 是   | 业务状态码（`200` 表示成功） |
| `data`         | `object`  | 是   | 接口返回的数据主体           |
| `data.hasMore` | `boolean` | 否   | 是否还有更多数据             |
| `data.offset`  | `number`  | 否   | -                            |
| `message`      | `string`  | 否   | 返回说明信息                 |

<!-- api-doc:response:end -->
