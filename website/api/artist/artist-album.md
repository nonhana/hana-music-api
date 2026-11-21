---
title: '获取歌手专辑'
description: '调用此接口，传入歌手 id，可获得歌手专辑内容'
---

# 获取歌手专辑

调用此接口，传入歌手 id，可获得歌手专辑内容

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                                 |
| ---------- | -------------------------------------------------- |
| 接口地址   | `/artist/album`                                    |
| 请求方式   | `GET` / `POST`                                     |
| 需要登录   | 否                                                 |
| 对应模块   | `artist_album`                                     |
| SDK 函数   | `artistAlbum`（`hana-music-api/api/artist_album`） |
| 返回体类型 | `ArtistAlbumBody`（已建模返回体）                  |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { artistAlbum } from 'hana-music-api';

const result = await artistAlbum({
  id: '6452',
  limit: 5,
});
console.log(result.body);
```

### HTTP

```bash
curl --get 'http://127.0.0.1:3021/artist/album' \
  --data-urlencode 'id=6452' \
  --data-urlencode 'limit=5'
```

<!-- api-doc:params:start -->

## 请求参数

| 参数     | 类型               | 必填 | 默认值 | 说明                                                                        |
| -------- | ------------------ | ---- | ------ | --------------------------------------------------------------------------- |
| `id`     | `number \| string` | 是   | -      | 歌手 id                                                                     |
| `limit`  | `number`           | 否   | `30`   | 取出数量，默认为 30                                                         |
| `offset` | `number`           | 否   | `0`    | 偏移数量，用于分页，如：(页数 - 1)\*30，其中 30 为 limit 的值，默认<br>为 0 |

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

返回体类型：`ArtistAlbumBody`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/artist_album`、`hana-music-api/schemas/artist_album` 导入运行时校验器）。

```ts
type Album = Omit<AlbumSummary, 'isSub'> & {
  isSub?: boolean | null;
};

type ArtistAlbumBody = {
  code: 200;
  artist?: Artist | null;
  hotAlbums: Array<Album>;
  more?: boolean | null;
};
```

- **公共类型**：[AlbumSummary](/api/shared-types#albumsummary)、[Artist](/api/shared-types#artist)

| 字段                | 类型                               | 必填 | 说明                                                            |
| ------------------- | ---------------------------------- | ---- | --------------------------------------------------------------- |
| `code`              | `200`                              | 是   | 业务状态码（`200` 表示成功）                                    |
| `artist`            | [Artist](/api/shared-types#artist) | 否   | 歌手详情                                                        |
| `hotAlbums`         | `Array<Album>`                     | 是   | 条目列表，继承自 [AlbumSummary](/api/shared-types#albumsummary) |
| `hotAlbums[].isSub` | `boolean`                          | 否   | -                                                               |
| `more`              | `boolean`                          | 否   | 是否还有更多数据                                                |

<!-- api-doc:response:end -->
