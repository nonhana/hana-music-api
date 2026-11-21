---
title: '云搜索'
description: '和搜索接口相同，但结果更完整。'
---

# 云搜索

和搜索接口相同，但结果更完整。

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                                |
| ---------- | ------------------------------------------------- |
| 接口地址   | `/cloudsearch`                                    |
| 请求方式   | `GET` / `POST`                                    |
| 需要登录   | 否                                                |
| 对应模块   | `cloudsearch`                                     |
| SDK 函数   | `cloudsearch`（`hana-music-api/api/cloudsearch`） |
| 返回体类型 | `CloudsearchBody`（已建模返回体）                 |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { cloudsearch } from 'hana-music-api';

const result = await cloudsearch({
  keywords: '海阔天空',
});
console.log(result.body);
```

### HTTP

```bash
curl --get 'http://127.0.0.1:3021/cloudsearch' \
  --data-urlencode 'keywords=海阔天空'
```

<!-- api-doc:params:start -->

## 请求参数

| 参数       | 类型                                                                             | 必填 | 默认值 | 说明                                                                                                                                                                                            |
| ---------- | -------------------------------------------------------------------------------- | ---- | ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `keywords` | `string`                                                                         | 是   | -      | 关键词                                                                                                                                                                                          |
| `limit`    | `number`                                                                         | 否   | `30`   | 返回数量，默认为 30 `offset` : 偏移数量，用于分页，如<br>: 如：(页数 - 1)\*30，其中 30 为 limit 的值，默认为 0                                                                                  |
| `offset`   | `number`                                                                         | 否   | `0`    | 偏移数量，用于分页                                                                                                                                                                              |
| `type`     | `1 \| 10 \| 100 \| 1000 \| 1002 \| 1004 \| 1006 \| 1009 \| 1014 \| 1018 \| 2000` | 否   | `1`    | 搜索类型；默认为 1 即单曲，取值意义 : 1: 单曲，10: 专辑，100: 歌手，1000:<br>歌单，1002: 用户，1004: MV，1006: 歌词，1009: 电台，1014: 视频，1018:综合，2000:声音(搜索声音返回字段格式会不一样) |

| `type` | 搜索内容                                           |
| ------ | -------------------------------------------------- |
| `1`    | 单曲                                               |
| `10`   | 专辑                                               |
| `100`  | 歌手                                               |
| `1000` | 歌单                                               |
| `1002` | 用户                                               |
| `1004` | MV                                                 |
| `1006` | 歌词                                               |
| `1009` | 电台                                               |
| `1014` | 视频                                               |
| `1018` | 综合                                               |
| `2000` | 声音（使用独立搜索接口，返回体结构为 `data` 形态） |

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

返回体类型：`CloudsearchBody`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/cloudsearch`、`hana-music-api/schemas/cloudsearch` 导入运行时校验器）。

```ts
type SearchedArtist = Omit<Artist, 'id'> & {
  id: number;
};

type SearchedPlaylist = {
  id: number;
  name?: string | null;
  coverImgUrl?: string | null;
  trackCount?: number | null;
  playCount?: number | null;
  creator?: {
    userId?: number | null;
    nickname?: string | null;
    authStatus?: number | null;
    avatarUrl?: string | null;
    userType?: number | null;
  } | null;
  bookCount?: number | null;
  description?: string | null;
  highQuality?: boolean | null;
  officialPlaylistTitle?: string | null;
  playlistType?: string | null;
  specialType?: number | null;
  subscribed?: boolean | null;
  userId?: number | null;
};

type CloudsearchBody = {
  code: 200;
  result: {
    songs?: Array<Song> | null;
    songCount?: number | null;
    albums?: Array<AlbumSummary> | null;
    albumCount?: number | null;
    artists?: Array<SearchedArtist> | null;
    artistCount?: number | null;
    playlists?: Array<SearchedPlaylist> | null;
    playlistCount?: number | null;
  };
  trp?: {
    rules?: Array<string> | null;
  } | null;
};
```

- **公共类型**：[AlbumSummary](/api/shared-types#albumsummary)、[Artist](/api/shared-types#artist)、[Song](/api/shared-types#song)

> 标为`可空`的路径在缺失或为 `null` 时正常返回，存在时按内部结构校验。

| 字段                   | 类型                                                    | 必填 | 说明                         |
| ---------------------- | ------------------------------------------------------- | ---- | ---------------------------- |
| `code`                 | `200`                                                   | 是   | 业务状态码（`200` 表示成功） |
| `result`               | `object`                                                | 是   | 接口返回的结果主体           |
| `result.songs`         | Array\<[Song](/api/shared-types#song)\>                 | 可空 | 歌曲列表                     |
| `result.songCount`     | `number`                                                | 否   | -                            |
| `result.albums`        | Array\<[AlbumSummary](/api/shared-types#albumsummary)\> | 可空 | 专辑列表                     |
| `result.albumCount`    | `number`                                                | 否   | -                            |
| `result.artists`       | `Array<SearchedArtist>`                                 | 可空 | 歌手列表                     |
| `result.artists[].id`  | `number`                                                | 是   | 记录 ID                      |
| `result.artistCount`   | `number`                                                | 否   | -                            |
| `result.playlists`     | `Array<SearchedPlaylist>`                               | 可空 | 歌单列表                     |
| `result.playlistCount` | `number`                                                | 否   | -                            |
| `trp`                  | `object`                                                | 否   | -                            |
| `trp.rules`            | `Array<string>`                                         | 否   | -                            |

<!-- api-doc:response:end -->

## 注意事项

- **声音搜索**：当 `type=2000` 时返回声音结构，建议在代码中按 `type` 分别读取 `result` 内的对应列表字段。
