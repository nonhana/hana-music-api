---
title: '热门电台'
description: '调用此接口,可获取热门电台'
---

# 热门电台

> 调用此接口,可获取热门电台

## 接口信息

| 项目     | 值             |
| -------- | -------------- |
| 接口地址 | `/dj/hot`      |
| 请求方式 | `GET` / `POST` |
| 需要登录 | 否             |
| 对应模块 | `dj_hot`       |
| 文档分类 | 电台与播客     |

## 请求参数

| 参数     | 类型             | 必填 | 默认值 | 说明                                                                    |
| -------- | ---------------- | :--: | ------ | ----------------------------------------------------------------------- |
| `limit`  | number \| string |  —   | 30     | 返回数量，默认为 30                                                     |
| `offset` | number \| string |  —   | 0      | 偏移数量，用于分页，如：(页数 - 1)\*30, 其中 30 为 limit 的值，默认为 0 |

## HTTP 示例

```bash
GET /dj/hot
```

## 编程式调用

```ts
import { djHot } from 'hana-music-api';

const result = await djHot();

console.log(result.body);
```

## 返回内容

`body.code`、通到热门电台列表的 `body.djRadios` 和每个电台的编号 `djRadios[].id` 收紧；`hasMore`、电台名称、封面、分类、计数、`copywriter`、`buyed` 和 `dj` 主播（复用宽松的 `PlaylistUser`）都是宽松字段。`offset=100000` 越界分页返回空数组、`hasMore: false`（录制 `dj_hot.empty.json`）；非数字 `limit` 返回 HTTP 200、正文 `code: 400`，SDK 按业务拒绝转交 `status: 400`。结构定义和类型是 `DjHotBody`，见 [返回体结构](/guide/response-bodies)。

## 补充说明

说明 : 调用此接口,可获取热门电台

**可选参数 :**

`limit` : 返回数量，默认为 30

`offset` : 偏移数量，用于分页，如：(页数 - 1)\*30, 其中 30 为 limit 的值，默认为 0
**接口地址 :** `/dj/hot`

**调用例子 :** `/dj/hot`
