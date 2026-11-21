---
title: '歌词摘录 - 删除摘录歌词'
description: '登录后调用此接口，传入摘录歌词id，删除摘录歌词'
---

# 歌词摘录 - 删除摘录歌词

登录后调用此接口，传入摘录歌词id，删除摘录歌词

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                                               |
| ---------- | ---------------------------------------------------------------- |
| 接口地址   | `/song/lyrics/mark/del`                                          |
| 请求方式   | `GET` / `POST`                                                   |
| 需要登录   | 是                                                               |
| 对应模块   | `song_lyrics_mark_del`                                           |
| SDK 函数   | `songLyricsMarkDel`（`hana-music-api/api/song_lyrics_mark_del`） |
| 返回体类型 | `SongLyricsMarkDelBody`（已建模返回体）                          |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { songLyricsMarkDel } from 'hana-music-api';

const result = await songLyricsMarkDel(
  {
    id: '2083850',
  },
  { cookie: 'MUSIC_U=your-cookie' },
);
console.log(result.body);
```

### HTTP

```bash
curl --get 'http://127.0.0.1:3021/song/lyrics/mark/del' \
  -H 'Cookie: MUSIC_U=your-cookie' \
  --data-urlencode 'id=2083850'
```

<!-- api-doc:params:start -->

## 请求参数

| 参数 | 类型               | 必填 | 默认值 | 说明       |
| ---- | ------------------ | ---- | ------ | ---------- |
| `id` | `number \| string` | 是   | -      | 摘录歌词id |

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

返回体类型：`SongLyricsMarkDelBody`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/song_lyrics_mark_del`、`hana-music-api/schemas/song_lyrics_mark_del` 导入运行时校验器）。

```ts
type LyricsMarkDeleteResult = {
  success: boolean;
};

type SongLyricsMarkDelBody = {
  code: 200;
  data: LyricsMarkDeleteResult;
  message?: string | null;
};
```

| 字段           | 类型                     | 必填 | 说明                         |
| -------------- | ------------------------ | ---- | ---------------------------- |
| `code`         | `200`                    | 是   | 业务状态码（`200` 表示成功） |
| `data`         | `LyricsMarkDeleteResult` | 是   | 接口返回的数据主体           |
| `data.success` | `boolean`                | 是   | 操作是否成功                 |
| `message`      | `string`                 | 否   | 返回说明信息                 |

<!-- api-doc:response:end -->
