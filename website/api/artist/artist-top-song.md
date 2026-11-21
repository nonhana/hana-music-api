---
title: '歌手热门 50 首歌曲'
description: '调用此接口，可获取歌手热门 50 首歌曲'
---

# 歌手热门 50 首歌曲

调用此接口，可获取歌手热门 50 首歌曲

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                                      |
| ---------- | ------------------------------------------------------- |
| 接口地址   | `/artist/top/song`                                      |
| 请求方式   | `GET` / `POST`                                          |
| 需要登录   | 否                                                      |
| 对应模块   | `artist_top_song`                                       |
| SDK 函数   | `artistTopSong`（`hana-music-api/api/artist_top_song`） |
| 返回体类型 | `ArtistTopSongBody`（已建模返回体）                     |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { artistTopSong } from 'hana-music-api';

const result = await artistTopSong({
  id: '6452',
});
console.log(result.body);
```

### HTTP

```bash
curl --get 'http://127.0.0.1:3021/artist/top/song' \
  --data-urlencode 'id=6452'
```

<!-- api-doc:params:start -->

## 请求参数

| 参数 | 类型               | 必填 | 默认值 | 说明    |
| ---- | ------------------ | ---- | ------ | ------- |
| `id` | `number \| string` | 是   | -      | 歌手 id |

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

返回体类型：`ArtistTopSongBody`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/artist_top_song`、`hana-music-api/schemas/artist_top_song` 导入运行时校验器）。

```ts
type ArtistTopSongBody = {
  code: 200;
  songs: Array<Song>;
  more?: boolean | null;
};
```

- **公共类型**：[Song](/api/shared-types#song)

| 字段    | 类型                                    | 必填 | 说明                         |
| ------- | --------------------------------------- | ---- | ---------------------------- |
| `code`  | `200`                                   | 是   | 业务状态码（`200` 表示成功） |
| `songs` | Array\<[Song](/api/shared-types#song)\> | 是   | 歌曲列表                     |
| `more`  | `boolean`                               | 否   | 是否还有更多数据             |

<!-- api-doc:response:end -->
