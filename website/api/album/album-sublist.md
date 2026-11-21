---
title: '获取已收藏专辑列表'
description: '调用此接口，可获得已收藏专辑列表'
---

# 获取已收藏专辑列表

调用此接口，可获得已收藏专辑列表

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                                   |
| ---------- | ---------------------------------------------------- |
| 接口地址   | `/album/sublist`                                     |
| 请求方式   | `GET` / `POST`                                       |
| 需要登录   | 否                                                   |
| 对应模块   | `album_sublist`                                      |
| SDK 函数   | `albumSublist`（`hana-music-api/api/album_sublist`） |
| 返回体类型 | `AlbumSublistBody`（已建模返回体）                   |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { albumSublist } from 'hana-music-api';

const result = await albumSublist({
  limit: 30,
});
console.log(result.body);
```

### HTTP

```bash
curl --get 'http://127.0.0.1:3021/album/sublist' \
  --data-urlencode 'limit=30'
```

<!-- api-doc:params:start -->

## 请求参数

| 参数     | 类型     | 必填 | 默认值 | 说明                                                                        |
| -------- | -------- | ---- | ------ | --------------------------------------------------------------------------- |
| `limit`  | `number` | 否   | `25`   | 取出数量，默认为 25                                                         |
| `offset` | `number` | 否   | `0`    | 偏移数量，用于分页，如：(页数 - 1)\*25，其中 25 为 limit 的值，默认<br>为 0 |

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

返回体类型：`AlbumSublistBody`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/album_sublist`、`hana-music-api/schemas/album_sublist` 导入运行时校验器）。

```ts
type SubscribedAlbum = {
  id: number;
  name?: string | null;
  picUrl?: string | null;
  size?: number | null;
  artists?: Array<Artist> | null;
  alias?: Array<string> | null;
  picId?: number | null;
  subTime?: number | null;
  transNames?: Array<string> | null;
};

type AlbumSublistBody = {
  code: 200;
  data: Array<SubscribedAlbum>;
  hasMore?: boolean | null;
  count?: number | null;
  paidCount?: number | null;
};
```

- **公共类型**：[Artist](/api/shared-types#artist)

| 字段                | 类型                                        | 必填 | 说明                         |
| ------------------- | ------------------------------------------- | ---- | ---------------------------- |
| `code`              | `200`                                       | 是   | 业务状态码（`200` 表示成功） |
| `data`              | `Array<SubscribedAlbum>`                    | 是   | 接口返回的数据主体           |
| `data[].id`         | `number`                                    | 是   | 记录 ID                      |
| `data[].name`       | `string`                                    | 否   | 名称                         |
| `data[].picUrl`     | `string`                                    | 否   | 资源访问链接                 |
| `data[].size`       | `number`                                    | 否   | -                            |
| `data[].artists`    | Array\<[Artist](/api/shared-types#artist)\> | 否   | 歌手列表                     |
| `data[].alias`      | `Array<string>`                             | 否   | -                            |
| `data[].picId`      | `number`                                    | 否   | pic ID                       |
| `data[].subTime`    | `number`                                    | 否   | 时间戳                       |
| `data[].transNames` | `Array<string>`                             | 否   | -                            |
| `hasMore`           | `boolean`                                   | 否   | 是否还有更多数据             |
| `count`             | `number`                                    | 否   | 条目总数                     |
| `paidCount`         | `number`                                    | 否   | -                            |

<!-- api-doc:response:end -->
