---
title: '数字专辑-新碟上架'
description: '调用此接口 ，可获取数字专辑-新碟上架'
---

# 数字专辑-新碟上架

调用此接口 ，可获取数字专辑-新碟上架

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                             |
| ---------- | ---------------------------------------------- |
| 接口地址   | `/album/list`                                  |
| 请求方式   | `GET` / `POST`                                 |
| 需要登录   | 否                                             |
| 对应模块   | `album_list`                                   |
| SDK 函数   | `albumList`（`hana-music-api/api/album_list`） |
| 返回体类型 | `AlbumListBody`（已建模返回体）                |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { albumList } from 'hana-music-api';

const result = await albumList({
  limit: 10,
});
console.log(result.body);
```

### HTTP

```bash
curl --get 'http://127.0.0.1:3021/album/list' \
  --data-urlencode 'limit=10'
```

<!-- api-doc:params:start -->

## 请求参数

| 参数     | 类型                                    | 必填 | 默认值 | 说明                                                                    |
| -------- | --------------------------------------- | ---- | ------ | ----------------------------------------------------------------------- |
| `area`   | `'ALL' \| 'ZH' \| 'EA' \| 'KR' \| 'JP'` | 否   | `ALL`  | 地区筛选，默认 `ALL`（`ALL`/`ZH`/`EA`/`KR`/`JP`）                       |
| `limit`  | `number`                                | 否   | `30`   | 返回数量，默认为 30                                                     |
| `offset` | `number`                                | 否   | `0`    | 偏移数量，用于分页，如：(页数 - 1)\*30，其中 30 为 limit 的值，默认为 0 |
| `type`   | `number`                                | 否   | -      | 列表类型筛选                                                            |

| `area` | 地区         |
| ------ | ------------ |
| `ALL`  | 全部（默认） |
| `ZH`   | 华语         |
| `EA`   | 欧美         |
| `KR`   | 韩国         |
| `JP`   | 日本         |

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

返回体类型：`AlbumListBody`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/album_list`、`hana-music-api/schemas/album_list` 导入运行时校验器）。

```ts
type AlbumProduct = {
  albumId: number;
  albumName?: string | null;
  albumType?: number | null;
  area?: number | null;
  artistName?: string | null;
  artistType?: number | null;
  coverUrl?: string | null;
  newAlbum?: boolean | null;
  price?: number | null;
  productId?: number | null;
  pubTime?: number | null;
  saleNum?: number | null;
  saleType?: number | null;
  status?: number | null;
};

type AlbumListBody = {
  code: 200;
  products: Array<AlbumProduct>;
};
```

| 字段       | 类型                  | 必填 | 说明                         |
| ---------- | --------------------- | ---- | ---------------------------- |
| `code`     | `200`                 | 是   | 业务状态码（`200` 表示成功） |
| `products` | `Array<AlbumProduct>` | 是   | 数字专辑商品列表             |

<!-- api-doc:response:end -->
