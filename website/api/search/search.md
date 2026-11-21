---
title: '搜索'
description: '按关键词搜索歌曲、专辑、歌手、歌单等内容。'
---

# 搜索

按关键词搜索歌曲、专辑、歌手、歌单等内容。关键词可以用空格分隔，比如“周杰伦 搁浅”。

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                                                                |
| ---------- | --------------------------------------------------------------------------------- |
| 接口地址   | `/search`                                                                         |
| 请求方式   | `GET` / `POST`                                                                    |
| 需要登录   | 否（可使用游客身份）                                                              |
| 对应模块   | `search`                                                                          |
| SDK 函数   | `search`（`hana-music-api/api/search`）                                           |
| 返回体类型 | `SearchBody`（已建模返回体）                                                      |
| 读缓存     | 支持共享读缓存与并发请求去重，详见 [缓存与身份池](/guide/cache-and-identity-pool) |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { search } from 'hana-music-api';

const result = await search({ keywords: '海阔天空', limit: 5, offset: 0 });
console.log(result.body);
```

### HTTP

```bash
curl --get 'http://127.0.0.1:3021/search' \
  --data-urlencode 'keywords=海阔天空' \
  --data-urlencode 'limit=5' \
  --data-urlencode 'offset=0'
```

<!-- api-doc:params:start -->

## 请求参数

| 参数       | 类型                                                                             | 必填 | 默认值 | 说明                                        |
| ---------- | -------------------------------------------------------------------------------- | ---- | ------ | ------------------------------------------- |
| `keywords` | `string`                                                                         | 是   | -      | 搜索关键词                                  |
| `limit`    | `number`                                                                         | 否   | `30`   | 返回数量                                    |
| `offset`   | `number`                                                                         | 否   | `0`    | 跳过的结果数量，一般为 `(页码 - 1) * limit` |
| `type`     | `1 \| 10 \| 100 \| 1000 \| 1002 \| 1004 \| 1006 \| 1009 \| 1014 \| 1018 \| 2000` | 否   | `1`    | 搜索类型，见下表                            |

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

返回体类型：`SearchBody`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/search`、`hana-music-api/schemas/search` 导入运行时校验器）。

```ts
type SearchedAlbum = Omit<AlbumSummary, 'alg' | 'containedSong'> & {
  alg?: string | null;
  containedSong?: string | null;
};

type SearchedArtist = Omit<
  Artist,
  | 'id'
  | 'appendRecText'
  | 'fansSize'
  | 'identityIconUrl'
  | 'recommendText'
  | 'alg'
> & {
  id: number;
  appendRecText?: string | null;
  fansSize?: number | null;
  identityIconUrl?: string | null;
  recommendText?: string | null;
  alg?: string | null;
};

type SearchedPlaylist = Omit<
  PlaylistSummary,
  | 'action'
  | 'actionType'
  | 'alg'
  | 'bookCount'
  | 'officialTags'
  | 'recommendText'
> & {
  action?: string | null;
  actionType?: string | null;
  alg?: string | null;
  bookCount?: number | null;
  officialTags?: Array<string> | null;
  recommendText?: string | null;
};

type SearchedMvArtist = {
  id?: number | null;
  name?: string | null;
};

type SearchedMv = {
  id: number;
  alg?: string | null;
  artistId?: number | null;
  artistName?: string | null;
  artists?: Array<SearchedMvArtist> | null;
  arTransName?: string | null;
  cover?: string | null;
  duration?: number | null;
  mark?: number | null;
  name?: string | null;
  playCount?: number | null;
};

type SearchResult = {
  songs?: Array<Song> | null;
  songCount?: number | null;
  albums?: Array<SearchedAlbum> | null;
  albumCount?: number | null;
  artists?: Array<SearchedArtist> | null;
  artistCount?: number | null;
  playlists?: Array<SearchedPlaylist> | null;
  playlistCount?: number | null;
  mvs?: Array<SearchedMv> | null;
  mvCount?: number | null;
  hasMore?: boolean | null;
  hlWords?: Array<string> | null;
};

type SearchBody = {
  code: 200;
  result?: SearchResult | null;
  trp?: {
    rules?: Array<string> | null;
  } | null;
};
```

- **公共类型**：[AlbumSummary](/api/shared-types#albumsummary)、[Artist](/api/shared-types#artist)、[PlaylistSummary](/api/shared-types#playlistsummary)、[Song](/api/shared-types#song)

> 标为`可空`的路径在缺失或为 `null` 时正常返回，存在时按内部结构校验。

| 字段                               | 类型                                    | 必填 | 说明                         |
| ---------------------------------- | --------------------------------------- | ---- | ---------------------------- |
| `code`                             | `200`                                   | 是   | 业务状态码（`200` 表示成功） |
| `result`                           | `SearchResult`                          | 可空 | 接口返回的结果主体           |
| `result.songs`                     | Array\<[Song](/api/shared-types#song)\> | 可空 | 歌曲列表                     |
| `result.songCount`                 | `number`                                | 否   | -                            |
| `result.albums`                    | `Array<SearchedAlbum>`                  | 可空 | 专辑列表                     |
| `result.albums[].alg`              | `string`                                | 否   | 推荐算法标识                 |
| `result.albums[].containedSong`    | `string`                                | 否   | -                            |
| `result.albumCount`                | `number`                                | 否   | -                            |
| `result.artists`                   | `Array<SearchedArtist>`                 | 可空 | 歌手列表                     |
| `result.artists[].id`              | `number`                                | 是   | 记录 ID                      |
| `result.artists[].appendRecText`   | `string`                                | 否   | -                            |
| `result.artists[].fansSize`        | `number`                                | 否   | 粉丝数                       |
| `result.artists[].identityIconUrl` | `string`                                | 否   | 资源访问链接                 |
| `result.artists[].recommendText`   | `string`                                | 否   | -                            |
| `result.artists[].alg`             | `string`                                | 否   | 推荐算法标识                 |
| `result.artistCount`               | `number`                                | 否   | -                            |
| `result.playlists`                 | `Array<SearchedPlaylist>`               | 可空 | 歌单列表                     |
| `result.playlists[].action`        | `string`                                | 否   | -                            |
| `result.playlists[].actionType`    | `string`                                | 否   | -                            |
| `result.playlists[].alg`           | `string`                                | 否   | 推荐算法标识                 |
| `result.playlists[].bookCount`     | `number`                                | 否   | 收藏数                       |
| `result.playlists[].officialTags`  | `Array<string>`                         | 否   | -                            |
| `result.playlists[].recommendText` | `string`                                | 否   | -                            |
| `result.playlistCount`             | `number`                                | 否   | -                            |
| `result.mvs`                       | `Array<SearchedMv>`                     | 可空 | MV 列表                      |
| `result.mvs[].id`                  | `number`                                | 是   | 记录 ID                      |
| `result.mvs[].alg`                 | `string`                                | 否   | 推荐算法标识                 |
| `result.mvs[].artistId`            | `number`                                | 否   | 歌手 ID                      |
| `result.mvs[].artistName`          | `string`                                | 否   | 歌手名称                     |
| `result.mvs[].artists`             | `Array<SearchedMvArtist>`               | 否   | 歌手列表                     |
| `result.mvs[].arTransName`         | `string`                                | 否   | 歌手译名                     |
| `result.mvs[].cover`               | `string`                                | 否   | 封面图片 URL                 |
| `result.mvs[].duration`            | `number`                                | 否   | 时长（毫秒）                 |
| `result.mvs[].mark`                | `number`                                | 否   | 状态标记位                   |
| `result.mvs[].name`                | `string`                                | 否   | 名称                         |
| `result.mvs[].playCount`           | `number`                                | 否   | 播放次数                     |
| `result.mvCount`                   | `number`                                | 否   | -                            |
| `result.hasMore`                   | `boolean`                               | 否   | 是否还有更多数据             |
| `result.hlWords`                   | `Array<string>`                         | 否   | -                            |
| `trp`                              | `object`                                | 否   | -                            |
| `trp.rules`                        | `Array<string>`                         | 否   | -                            |

<!-- api-doc:response:end -->

## 注意事项

- **读缓存与并发请求去重**：本接口支持共享读缓存与并发请求去重，未声明的请求字段会在输入校验时被拒绝，详见 [缓存与身份池](/guide/cache-and-identity-pool)。
- **声音搜索**：当 `type=2000` 时请求独立声音搜索接口，返回体结构位于 `data` 字段而非 `result`。
