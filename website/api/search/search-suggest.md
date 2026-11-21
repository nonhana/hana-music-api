---
title: '搜索建议'
description: '调用此接口，传入搜索关键词可获得搜索建议，搜索结果同时包含单曲，歌手，歌单信息'
---

# 搜索建议

调用此接口，传入搜索关键词可获得搜索建议，搜索结果同时包含单曲，歌手，歌单信息

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                                     |
| ---------- | ------------------------------------------------------ |
| 接口地址   | `/search/suggest`                                      |
| 请求方式   | `GET` / `POST`                                         |
| 需要登录   | 否                                                     |
| 对应模块   | `search_suggest`                                       |
| SDK 函数   | `searchSuggest`（`hana-music-api/api/search_suggest`） |
| 返回体类型 | `SearchSuggestBody`（已建模返回体）                    |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { searchSuggest } from 'hana-music-api';

const result = await searchSuggest({
  keywords: '海阔天空',
});
console.log(result.body);
```

### HTTP

```bash
curl --get 'http://127.0.0.1:3021/search/suggest' \
  --data-urlencode 'keywords=海阔天空'
```

<!-- api-doc:params:start -->

## 请求参数

| 参数       | 类型     | 必填 | 默认值 | 说明                             |
| ---------- | -------- | ---- | ------ | -------------------------------- |
| `keywords` | `string` | 否   | ``     | 关键词                           |
| `type`     | `string` | 否   | -      | 如果传 'mobile' 则返回移动端数据 |

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

返回体类型：`SearchSuggestBody`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/search_suggest`、`hana-music-api/schemas/search_suggest` 导入运行时校验器）。

```ts
type SuggestedSong = {
  id: number;
  name?: string | null;
  album?: SimpleAlbum | null;
  alias?: Array<string> | null;
  artists?: Array<Artist> | null;
  copyrightId?: number | null;
  duration?: number | null;
  fee?: number | null;
  ftype?: number | null;
  mark?: number | null;
  mvid?: number | null;
  rtype?: number | null;
  status?: number | null;
  transNames?: Array<string> | null;
};

type SuggestedArtist = Omit<Artist, 'id'> & {
  id: number;
};

type SuggestedPlaylist = {
  id: number;
  name?: string | null;
  coverImgUrl?: string | null;
  creator?: {
    userId?: number | null;
    nickname?: string | null;
  } | null;
  bookCount?: number | null;
  description?: string | null;
  highQuality?: boolean | null;
  officialPlaylistTitle?: string | null;
  playCount?: number | null;
  playlistType?: string | null;
  specialType?: number | null;
  subscribed?: boolean | null;
  trackCount?: number | null;
  userId?: number | null;
};

type AllMatch = {
  keyword: string;
  alg?: string | null;
  feature?: string | null;
  lastKeyword?: string | null;
  type?: number | null;
};

type SearchSuggestBody = {
  code: 200;
  result: {
    songs?: Array<SuggestedSong> | null;
    artists?: Array<SuggestedArtist> | null;
    albums?: Array<AlbumSummary> | null;
    playlists?: Array<SuggestedPlaylist> | null;
    allMatch?: Array<AllMatch> | null;
    order?: Array<string> | null;
  };
};
```

- **公共类型**：[AlbumSummary](/api/shared-types#albumsummary)、[Artist](/api/shared-types#artist)、[SimpleAlbum](/api/shared-types#simplealbum)

> 标为`可空`的路径在缺失或为 `null` 时正常返回，存在时按内部结构校验。

| 字段                            | 类型                                                    | 必填 | 说明                         |
| ------------------------------- | ------------------------------------------------------- | ---- | ---------------------------- |
| `code`                          | `200`                                                   | 是   | 业务状态码（`200` 表示成功） |
| `result`                        | `object`                                                | 是   | 接口返回的结果主体           |
| `result.songs`                  | `Array<SuggestedSong>`                                  | 可空 | 歌曲列表                     |
| `result.artists`                | `Array<SuggestedArtist>`                                | 可空 | 歌手列表                     |
| `result.artists[].id`           | `number`                                                | 是   | 记录 ID                      |
| `result.albums`                 | Array\<[AlbumSummary](/api/shared-types#albumsummary)\> | 可空 | 专辑列表                     |
| `result.playlists`              | `Array<SuggestedPlaylist>`                              | 可空 | 歌单列表                     |
| `result.allMatch`               | `Array<AllMatch>`                                       | 可空 | -                            |
| `result.allMatch[].keyword`     | `string`                                                | 是   | -                            |
| `result.allMatch[].alg`         | `string`                                                | 否   | 推荐算法标识                 |
| `result.allMatch[].feature`     | `string`                                                | 否   | -                            |
| `result.allMatch[].lastKeyword` | `string`                                                | 否   | -                            |
| `result.allMatch[].type`        | `number`                                                | 否   | -                            |
| `result.order`                  | `Array<string>`                                         | 否   | -                            |

<!-- api-doc:response:end -->
