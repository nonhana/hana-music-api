---
title: '歌单 ( 网友精选碟 )'
description: '调用此接口，可获取网友精选碟歌单'
---

# 歌单 ( 网友精选碟 )

调用此接口，可获取网友精选碟歌单

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                                 |
| ---------- | -------------------------------------------------- |
| 接口地址   | `/top/playlist`                                    |
| 请求方式   | `GET` / `POST`                                     |
| 需要登录   | 否                                                 |
| 对应模块   | `top_playlist`                                     |
| SDK 函数   | `topPlaylist`（`hana-music-api/api/top_playlist`） |
| 返回体类型 | `TopPlaylistBody`（已建模返回体）                  |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { topPlaylist } from 'hana-music-api';

const result = await topPlaylist({
  limit: 10,
  order: 'new',
});
console.log(result.body);
```

### HTTP

```bash
curl --get 'http://127.0.0.1:3021/top/playlist' \
  --data-urlencode 'limit=10' \
  --data-urlencode 'order=new'
```

<!-- api-doc:params:start -->

## 请求参数

| 参数     | 类型             | 必填 | 默认值 | 说明                                                                                                         |
| -------- | ---------------- | ---- | ------ | ------------------------------------------------------------------------------------------------------------ |
| `cat`    | `string`         | 否   | `全部` | tag，比如 " 华语 "、" 古风 " 、" 欧美 "、" 流行 "，默认为<br>"全部"，可从歌单分类接口获取(/playlist/catlist) |
| `order`  | `'hot' \| 'new'` | 否   | `hot`  | 可选值为 'new' 和 'hot'，分别对应最新和最热，默认为<br>'hot'                                                 |
| `limit`  | `number`         | 否   | `50`   | 取出歌单数量，默认为 50                                                                                      |
| `offset` | `number`         | 否   | `0`    | 偏移数量，用于分页，如：(评论页数 - 1)\*50，其中 50 为 limit 的值                                            |

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

返回体类型：`TopPlaylistBody`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/top_playlist`、`hana-music-api/schemas/top_playlist` 导入运行时校验器）。

```ts
type TopPlaylistSummary = Omit<
  PlaylistSummary,
  'alg' | 'backgroundImageId' | 'originalCoverId' | 'tsSongCount'
> & {
  alg?: string | null;
  backgroundImageId?: number | null;
  originalCoverId?: number | null;
  tsSongCount?: number | null;
};

type TopPlaylistBody =
  | {
      code: 200;
      playlists: Array<TopPlaylistSummary>;
      total?: number | null;
      more?: boolean | null;
      cat?: string | null;
    }
  | '';
```

- **公共类型**：[PlaylistSummary](/api/shared-types#playlistsummary)

| 字段                            | 类型                        | 必填 | 说明                         |
| ------------------------------- | --------------------------- | ---- | ---------------------------- |
| `code`                          | `200`                       | 是   | 业务状态码（`200` 表示成功） |
| `playlists`                     | `Array<TopPlaylistSummary>` | 是   | 歌单列表                     |
| `playlists[].alg`               | `string`                    | 否   | 推荐算法标识                 |
| `playlists[].backgroundImageId` | `number`                    | 否   | backgroundImage ID           |
| `playlists[].originalCoverId`   | `number`                    | 否   | originalCover ID             |
| `playlists[].tsSongCount`       | `number`                    | 否   | -                            |
| `total`                         | `number`                    | 否   | 总条目数                     |
| `more`                          | `boolean`                   | 否   | 是否还有更多数据             |
| `cat`                           | `string`                    | 否   | -                            |

> 当参数格式异常时，上游可能返回空响应，此时返回体为 `""`。

<!-- api-doc:response:end -->
