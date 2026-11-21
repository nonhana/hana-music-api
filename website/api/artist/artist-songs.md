---
title: '歌手全部歌曲'
description: '调用此接口，可获取歌手全部歌曲'
---

# 歌手全部歌曲

调用此接口，可获取歌手全部歌曲

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                                 |
| ---------- | -------------------------------------------------- |
| 接口地址   | `/artist/songs`                                    |
| 请求方式   | `GET` / `POST`                                     |
| 需要登录   | 否                                                 |
| 对应模块   | `artist_songs`                                     |
| SDK 函数   | `artistSongs`（`hana-music-api/api/artist_songs`） |
| 返回体类型 | `ArtistSongsBody`（已建模返回体）                  |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { artistSongs } from 'hana-music-api';

const result = await artistSongs({
  id: '6452',
});
console.log(result.body);
```

### HTTP

```bash
curl --get 'http://127.0.0.1:3021/artist/songs' \
  --data-urlencode 'id=6452'
```

<!-- api-doc:params:start -->

## 请求参数

| 参数     | 类型               | 必填 | 默认值 | 说明                                                              |
| -------- | ------------------ | ---- | ------ | ----------------------------------------------------------------- |
| `id`     | `number \| string` | 是   | -      | 歌手 id                                                           |
| `limit`  | `number`           | 否   | `100`  | 取出歌单数量，默认为 50                                           |
| `offset` | `number`           | 否   | `0`    | 偏移数量，用于分页，如：(评论页数 - 1)\*50，其中 50 为 limit 的值 |
| `order`  | `'hot' \| 'time'`  | 否   | `hot`  | `hot` ，`time` 按照热门或者时间排序                               |

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

返回体类型：`ArtistSongsBody`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/artist_songs`、`hana-music-api/schemas/artist_songs` 导入运行时校验器）。

```ts
type NoCopyrightMvInfoVideo = {
  check?: boolean | null;
  container?: string | null;
  duration?: number | null;
  height?: number | null;
  md5?: string | null;
  size?: number | null;
  tag?: string | null;
  width?: number | null;
};

type NoCopyrightRcmd = {
  expInfo?: {
    mvPlay?: boolean | null;
  } | null;
  mvInfo?: {
    id?: number | null;
    pic16v9Url?: string | null;
    pic4v3?: number | null;
    type?: string | null;
    videos?: Array<NoCopyrightMvInfoVideo> | null;
  } | null;
  type?: number | null;
  typeDesc?: string | null;
};

type ArtistSong = Omit<Song, 'noCopyrightRcmd' | 'eq'> & {
  noCopyrightRcmd?: NoCopyrightRcmd | null;
  eq?: string | null;
};

type ArtistSongsBody = {
  code: 200;
  songs: Array<ArtistSong>;
  more?: boolean | null;
  total?: number | null;
};
```

- **公共类型**：[Song](/api/shared-types#song)

| 字段                      | 类型                | 必填 | 说明                         |
| ------------------------- | ------------------- | ---- | ---------------------------- |
| `code`                    | `200`               | 是   | 业务状态码（`200` 表示成功） |
| `songs`                   | `Array<ArtistSong>` | 是   | 歌曲列表                     |
| `songs[].noCopyrightRcmd` | `NoCopyrightRcmd`   | 否   | -                            |
| `songs[].eq`              | `string`            | 否   | -                            |
| `more`                    | `boolean`           | 否   | 是否还有更多数据             |
| `total`                   | `number`            | 否   | 总条目数                     |

<!-- api-doc:response:end -->
