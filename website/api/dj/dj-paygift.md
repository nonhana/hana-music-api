---
title: '电台 - 付费精选'
description: '可以获取付费精选的电台列表，传入 `limit` 和 `offset` 可以进行分页'
---

# 电台 - 付费精选

> 可以获取付费精选的电台列表，传入 `limit` 和 `offset` 可以进行分页

## 接口信息

| 项目     | 值             |
| -------- | -------------- |
| 接口地址 | `/dj/paygift`  |
| 请求方式 | `GET` / `POST` |
| 需要登录 | 否             |
| 对应模块 | `dj_paygift`   |
| 文档分类 | 电台与播客     |

## 请求参数

| 参数     | 类型             | 必填 | 默认值 | 说明                                                                    |
| -------- | ---------------- | :--: | ------ | ----------------------------------------------------------------------- |
| `limit`  | number \| string |  —   | 30     | 返回数量，默认为 30                                                     |
| `offset` | number \| string |  —   | 0      | 偏移数量，用于分页，如：(页数 - 1)\*30, 其中 30 为 limit 的值，默认为 0 |

## HTTP 示例

```bash
GET /dj/paygift?limit=10&offset=20
```

## 编程式调用

```ts
import { djPaygift } from 'hana-music-api';

const result = await djPaygift({
  limit: '10',
  offset: '20',
});

console.log(result.body);
```

## 返回内容

`body.code`、通到付费电台列表的 `body.data.list` 和每个电台的编号 `data.list[].id` 收紧；`data.hasMore`、电台名称、封面、`rcmdText`、`alg`、`lastProgramName`、`originalPrice`、`discountPrice`、计数和 `subed` 都是宽松字段。`msg`、`icon`、`traceId`、`playCount` 在本批录制里只见过 `null`，没有声明。`offset=100000` 越界分页返回空数组、`hasMore: false`（录制 `dj_paygift.empty.json`）；非数字 `limit` 返回 HTTP 200、正文 `code: 400`，SDK 按业务拒绝转交 `status: 400`。结构定义和类型是 `DjPaygiftBody`，见 [返回体结构](/guide/response-bodies)。

## 补充说明

说明 : 可以获取付费精选的电台列表，传入 `limit` 和 `offset` 可以进行分页

**可选参数 :**

`limit` : 返回数量，默认为 30

`offset` : 偏移数量，用于分页，如：(页数 - 1)\*30, 其中 30 为 limit 的值，默认为 0

**接口地址 :** `/dj/paygift`

**调用例子 :** `/dj/paygift?limit=10&offset=20`
