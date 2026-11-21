---
title: '收藏的歌手列表'
description: '调用此接口，可获取收藏的歌手列表'
---

# 收藏的歌手列表

调用此接口，可获取收藏的歌手列表

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                                     |
| ---------- | ------------------------------------------------------ |
| 接口地址   | `/artist/sublist`                                      |
| 请求方式   | `GET` / `POST`                                         |
| 需要登录   | 否                                                     |
| 对应模块   | `artist_sublist`                                       |
| SDK 函数   | `artistSublist`（`hana-music-api/api/artist_sublist`） |
| 返回体类型 | `ArtistSublistBody`（已建模返回体）                    |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { artistSublist } from 'hana-music-api';

const result = await artistSublist({
  limit: 30,
});
console.log(result.body);
```

### HTTP

```bash
curl --get 'http://127.0.0.1:3021/artist/sublist' \
  --data-urlencode 'limit=30'
```

<!-- api-doc:params:start -->

## 请求参数

| 参数     | 类型     | 必填 | 默认值 | 说明                                                              |
| -------- | -------- | ---- | ------ | ----------------------------------------------------------------- |
| `limit`  | `number` | 否   | `25`   | 取出歌单数量，默认为 25                                           |
| `offset` | `number` | 否   | `0`    | 偏移数量，用于分页，如：(评论页数 - 1)\*25，其中 25 为 limit 的值 |

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

返回体类型：`ArtistSublistBody`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/artist_sublist`、`hana-music-api/schemas/artist_sublist` 导入运行时校验器）。

```ts
type SubscribedArtist = {
  id: number;
  name?: string | null;
  picUrl?: string | null;
  albumSize?: number | null;
  alias?: Array<string> | null;
  img1v1Url?: string | null;
  info?: string | null;
  mvSize?: number | null;
  picId?: number | null;
  trans?: string | null;
};

type ArtistSublistBody = {
  code: 200;
  data: Array<SubscribedArtist>;
  hasMore?: boolean | null;
  count?: number | null;
};
```

| 字段               | 类型                      | 必填 | 说明                         |
| ------------------ | ------------------------- | ---- | ---------------------------- |
| `code`             | `200`                     | 是   | 业务状态码（`200` 表示成功） |
| `data`             | `Array<SubscribedArtist>` | 是   | 接口返回的数据主体           |
| `data[].id`        | `number`                  | 是   | 记录 ID                      |
| `data[].name`      | `string`                  | 否   | 名称                         |
| `data[].picUrl`    | `string`                  | 否   | 资源访问链接                 |
| `data[].albumSize` | `number`                  | 否   | -                            |
| `data[].alias`     | `Array<string>`           | 否   | -                            |
| `data[].img1v1Url` | `string`                  | 否   | 资源访问链接                 |
| `data[].info`      | `string`                  | 否   | -                            |
| `data[].mvSize`    | `number`                  | 否   | -                            |
| `data[].picId`     | `number`                  | 否   | pic ID                       |
| `data[].trans`     | `string`                  | 否   | -                            |
| `hasMore`          | `boolean`                 | 否   | 是否还有更多数据             |
| `count`            | `number`                  | 否   | 条目总数                     |

<!-- api-doc:response:end -->
