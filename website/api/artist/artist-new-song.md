---
title: '关注歌手新歌'
description: '登录后调用此接口可获取关注歌手新歌'
---

# 关注歌手新歌

登录后调用此接口可获取关注歌手新歌

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                                      |
| ---------- | ------------------------------------------------------- |
| 接口地址   | `/artist/new/song`                                      |
| 请求方式   | `GET` / `POST`                                          |
| 需要登录   | 是                                                      |
| 对应模块   | `artist_new_song`                                       |
| SDK 函数   | `artistNewSong`（`hana-music-api/api/artist_new_song`） |
| 返回体类型 | `ArtistNewSongBody`（已建模返回体）                     |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { artistNewSong } from 'hana-music-api';

const result = await artistNewSong(
  {
    limit: 1,
  },
  { cookie: 'MUSIC_U=your-cookie' },
);
console.log(result.body);
```

### HTTP

```bash
curl --get 'http://127.0.0.1:3021/artist/new/song' \
  -H 'Cookie: MUSIC_U=your-cookie' \
  --data-urlencode 'limit=1'
```

<!-- api-doc:params:start -->

## 请求参数

| 参数     | 类型     | 必填 | 默认值     | 说明                                |
| -------- | -------- | ---- | ---------- | ----------------------------------- |
| `before` | `number` | 否   | 当前时间戳 | 上一页数据返回的 publishTime 的数据 |
| `limit`  | `number` | 否   | `20`       | 取出评论数量，默认为 20             |

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

返回体类型：`ArtistNewSongBody`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/artist_new_song`、`hana-music-api/schemas/artist_new_song` 导入运行时校验器）。

```ts
type BlockTitle = {
  artistId?: number | null;
  artistName?: string | null;
  artistUserId?: number | null;
  artisAlias?: string | null;
  artisTransName?: string | null;
  imgUrl?: string | null;
  publishDate?: string | null;
  publishTime?: number | null;
  resourceId?: number | null;
  resourceName?: string | null;
  resourcePicUrl?: string | null;
};

type NewSongBlock = {
  accompanimentIds?: Array<number> | null;
  albumId?: number | null;
  albumSongCount?: number | null;
  blockTitle?: BlockTitle | null;
  blockType?: string | null;
  publishTime?: number | null;
  songLists: Array<Song>;
};

type ArtistNewSongBody = {
  code: 200;
  message?: string | null;
  data: {
    hasMore?: boolean | null;
    newSongCount?: number | null;
    newWorks: Array<NewSongBlock>;
  };
};
```

- **公共类型**：[Song](/api/shared-types#song)

| 字段                               | 类型                                    | 必填 | 说明                         |
| ---------------------------------- | --------------------------------------- | ---- | ---------------------------- |
| `code`                             | `200`                                   | 是   | 业务状态码（`200` 表示成功） |
| `message`                          | `string`                                | 否   | 返回说明信息                 |
| `data`                             | `object`                                | 是   | 接口返回的数据主体           |
| `data.hasMore`                     | `boolean`                               | 否   | 是否还有更多数据             |
| `data.newSongCount`                | `number`                                | 否   | -                            |
| `data.newWorks`                    | `Array<NewSongBlock>`                   | 是   | -                            |
| `data.newWorks[].accompanimentIds` | `Array<number>`                         | 否   | -                            |
| `data.newWorks[].albumId`          | `number`                                | 否   | 专辑 ID                      |
| `data.newWorks[].albumSongCount`   | `number`                                | 否   | -                            |
| `data.newWorks[].blockTitle`       | `BlockTitle`                            | 否   | -                            |
| `data.newWorks[].blockType`        | `string`                                | 否   | -                            |
| `data.newWorks[].publishTime`      | `number`                                | 否   | 时间戳                       |
| `data.newWorks[].songLists`        | Array\<[Song](/api/shared-types#song)\> | 是   | Song 列表                    |

<!-- api-doc:response:end -->
