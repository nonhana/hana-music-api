---
title: '数字专辑-新碟上架'
description: '调用此接口 ,可获取数字专辑-新碟上架'
---

# 数字专辑-新碟上架

> 调用此接口 ,可获取数字专辑-新碟上架

## 接口信息

| 项目     | 值             |
| -------- | -------------- |
| 接口地址 | `/album/list`  |
| 请求方式 | `GET` / `POST` |
| 需要登录 | 否             |
| 对应模块 | `album_list`   |
| 文档分类 | 专辑           |

## 请求参数

| 参数     | 类型             | 必填 | 默认值 | 说明                                                                    |
| -------- | ---------------- | :--: | ------ | ----------------------------------------------------------------------- |
| `limit`  | number \| string |  —   | 30     | 返回数量，默认为 30                                                     |
| `offset` | number \| string |  —   | 0      | 偏移数量，用于分页，如：(页数 - 1)\*30, 其中 30 为 limit 的值，默认为 0 |

## HTTP 示例

```bash
GET /album/list?limit=10
```

## 编程式调用

```ts
import { albumList } from 'hana-music-api';

const result = await albumList({
  limit: '10',
});

console.log(result.body);
```

## 返回内容

`body.code`、`body.products` 和每张专辑的 `products[].albumId` 收紧；`albumName`、`price`、`saleNum`、`coverUrl`、`area`、`saleType` 等其余字段宽松。上游没有返回总数，`offset` 也没有生效：`album_list.offset-100000.json` 里 `offset=100000` 仍返回与第一页相同的 10 个 `albumId`。本批录制与探测未发现可达的空结果；`products` 数组本身允许为空。结构定义和类型是 `AlbumListBody`，见 [返回体结构](/guide/response-bodies)。

## 补充说明

说明 : 调用此接口 ,可获取数字专辑-新碟上架

**可选参数 :**

`limit` : 返回数量，默认为 30

`offset` : 偏移数量，用于分页，如：(页数 - 1)\*30, 其中 30 为 limit 的值，默认为 0  
**接口地址 :** `/album/list`

**调用例子 :** `/album/list?limit=10`
