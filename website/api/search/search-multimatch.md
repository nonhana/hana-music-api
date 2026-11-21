---
title: '搜索多重匹配'
description: '调用此接口，传入搜索关键词可获得搜索结果'
---

# 搜索多重匹配

调用此接口，传入搜索关键词可获得搜索结果

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                                           |
| ---------- | ------------------------------------------------------------ |
| 接口地址   | `/search/multimatch`                                         |
| 请求方式   | `GET` / `POST`                                               |
| 需要登录   | 否                                                           |
| 对应模块   | `search_multimatch`                                          |
| SDK 函数   | `searchMultimatch`（`hana-music-api/api/search_multimatch`） |
| 返回体类型 | `SearchMultimatchBody`（已建模返回体）                       |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { searchMultimatch } from 'hana-music-api';

const result = await searchMultimatch({
  keywords: '海阔天空',
});
console.log(result.body);
```

### HTTP

```bash
curl --get 'http://127.0.0.1:3021/search/multimatch' \
  --data-urlencode 'keywords=海阔天空'
```

<!-- api-doc:params:start -->

## 请求参数

| 参数       | 类型     | 必填 | 默认值 | 说明               |
| ---------- | -------- | ---- | ------ | ------------------ |
| `keywords` | `string` | 否   | ``     | 关键词             |
| `type`     | `number` | 否   | `1`    | 搜索类型，默认 `1` |

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

返回体类型：`SearchMultimatchBody`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/search_multimatch`、`hana-music-api/schemas/search_multimatch` 导入运行时校验器）。

```ts
type SuggestedArtist = Omit<
  Artist,
  'id' | 'alg' | 'fansSize' | 'occupation' | 'videoSize'
> & {
  id: number;
  alg?: string | null;
  fansSize?: number | null;
  occupation?: string | null;
  videoSize?: number | null;
};

type MlogBaseData = {
  id?: string | null;
  type?: number | null;
  text?: string | null;
  coverColor?: number | null;
  coverHeight?: number | null;
  coverWidth?: number | null;
  coverPicKey?: string | null;
  coverUrl?: string | null;
  duration?: number | null;
  pubTime?: number | null;
  threadId?: string | null;
};

type MlogArtist = {
  id?: number | null;
  name?: string | null;
  img1v1Url?: string | null;
};

type MlogExt = {
  artistName?: string | null;
  artists?: Array<MlogArtist> | null;
  canCollect?: boolean | null;
  commentCount?: number | null;
  likedCount?: number | null;
  playCount?: number | null;
  song?: MlogSong | null;
};

type MlogResource = {
  mlogBaseData?: MlogBaseData | null;
  mlogExtVO?: MlogExt | null;
  shareUrl?: string | null;
  status?: number | null;
};

type MlogBaseInfo = {
  id?: string | null;
  type?: number | null;
  mlogBaseDataType?: number | null;
  matchField?: number | null;
  sameCity?: boolean | null;
  resource?: MlogResource | null;
};

type SuggestedMlog = {
  resourceId: string;
  resourceType?: string | null;
  resourceName?: string | null;
  alg?: string | null;
  baseInfo?: MlogBaseInfo | null;
};

type SuggestedPlaylist = Omit<
  PlaylistSummary,
  'alg' | 'backgroundImageId' | 'originalCoverId' | 'tsSongCount'
> & {
  alg?: string | null;
  backgroundImageId?: number | null;
  originalCoverId?: number | null;
  tsSongCount?: number | null;
};

type SearchMultimatchBody = {
  code: 200;
  result: {
    artist?: Array<SuggestedArtist> | null;
    new_mlog?: Array<SuggestedMlog> | null;
    playlist?: Array<SuggestedPlaylist> | null;
    orders?: Array<string> | null;
  };
};
```

- **公共类型**：[Artist](/api/shared-types#artist)、[MlogSong](/api/shared-types#mlogsong)、[PlaylistSummary](/api/shared-types#playlistsummary)

> 标为`可空`的路径在缺失或为 `null` 时正常返回，存在时按内部结构校验。

| 字段                                  | 类型                       | 必填 | 说明                         |
| ------------------------------------- | -------------------------- | ---- | ---------------------------- |
| `code`                                | `200`                      | 是   | 业务状态码（`200` 表示成功） |
| `result`                              | `object`                   | 是   | 接口返回的结果主体           |
| `result.artist`                       | `Array<SuggestedArtist>`   | 可空 | 歌手详情                     |
| `result.artist[].id`                  | `number`                   | 是   | 记录 ID                      |
| `result.artist[].alg`                 | `string`                   | 否   | 推荐算法标识                 |
| `result.artist[].fansSize`            | `number`                   | 否   | 粉丝数                       |
| `result.artist[].occupation`          | `string`                   | 否   | -                            |
| `result.artist[].videoSize`           | `number`                   | 否   | -                            |
| `result.new_mlog`                     | `Array<SuggestedMlog>`     | 可空 | -                            |
| `result.new_mlog[].resourceId`        | `string`                   | 是   | 资源 ID                      |
| `result.new_mlog[].resourceType`      | `string`                   | 否   | -                            |
| `result.new_mlog[].resourceName`      | `string`                   | 否   | -                            |
| `result.new_mlog[].alg`               | `string`                   | 否   | 推荐算法标识                 |
| `result.new_mlog[].baseInfo`          | `MlogBaseInfo`             | 否   | -                            |
| `result.playlist`                     | `Array<SuggestedPlaylist>` | 可空 | 歌单详情                     |
| `result.playlist[].alg`               | `string`                   | 否   | 推荐算法标识                 |
| `result.playlist[].backgroundImageId` | `number`                   | 否   | backgroundImage ID           |
| `result.playlist[].originalCoverId`   | `number`                   | 否   | originalCover ID             |
| `result.playlist[].tsSongCount`       | `number`                   | 否   | -                            |
| `result.orders`                       | `Array<string>`            | 否   | -                            |

<!-- api-doc:response:end -->
