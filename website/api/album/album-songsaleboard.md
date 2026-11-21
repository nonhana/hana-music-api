---
title: '数字专辑&数字单曲-榜单'
description: '获取数字专辑或数字单曲的销售榜单。'
---

# 数字专辑&数字单曲-榜单

获取数字专辑或数字单曲的销售榜单。

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                                               |
| ---------- | ---------------------------------------------------------------- |
| 接口地址   | `/album/songsaleboard`                                           |
| 请求方式   | `GET` / `POST`                                                   |
| 需要登录   | 否                                                               |
| 对应模块   | `album_songsaleboard`                                            |
| SDK 函数   | `albumSongsaleboard`（`hana-music-api/api/album_songsaleboard`） |
| 返回体类型 | `AlbumSongsaleboardBody`（已建模返回体）                         |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { albumSongsaleboard } from 'hana-music-api';

const result = await albumSongsaleboard({
  type: 'year',
  year: 2020,
  albumType: 0,
});
console.log(result.body);
```

### HTTP

```bash
curl --get 'http://127.0.0.1:3021/album/songsaleboard' \
  --data-urlencode 'type=year' \
  --data-urlencode 'year=2020' \
  --data-urlencode 'albumType=0'
```

<!-- api-doc:params:start -->

## 请求参数

| 参数        | 类型     | 必填 | 默认值  | 说明                                            |
| ----------- | -------- | ---- | ------- | ----------------------------------------------- |
| `albumType` | `number` | 否   | `0`     | 榜单对象类型，`0` 为数字专辑，`1` 为数字单曲    |
| `type`      | `string` | 否   | `daily` | 榜单周期，可选 `daily`、`week`、`year`、`total` |
| `year`      | `number` | 否   | -       | 当 `type=year` 时使用，表示年份                 |

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

返回体类型：`AlbumSongsaleboardBody`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/album_songsaleboard`、`hana-music-api/schemas/album_songsaleboard` 导入运行时校验器）。

```ts
type SalesProduct = {
  albumId: number;
  albumName?: string | null;
  albumType?: number | null;
  artistName?: string | null;
  bundling?: number | null;
  coverUrl?: string | null;
  newAlbum?: boolean | null;
  newest?: boolean | null;
  period?: number | null;
  price?: number | null;
  rank?: number | null;
  rankIncr?: number | null;
  saleNum?: number | null;
  salesCertificationSystemLevelCode?: string | null;
  saleType?: number | null;
  status?: number | null;
};

type AlbumSongsaleboardBody = {
  code: 200;
  products: Array<SalesProduct>;
  hasMore?: boolean | null;
};
```

| 字段       | 类型                  | 必填 | 说明                         |
| ---------- | --------------------- | ---- | ---------------------------- |
| `code`     | `200`                 | 是   | 业务状态码（`200` 表示成功） |
| `products` | `Array<SalesProduct>` | 是   | 数字专辑商品列表             |
| `hasMore`  | `boolean`             | 否   | 是否还有更多数据             |

<!-- api-doc:response:end -->
