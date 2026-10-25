---
title: '电台 - 付费精品'
description: '调用此接口,可获取付费精品电台'
---

# 电台 - 付费精品

> 调用此接口,可获取付费精品电台

## 接口信息

| 项目     | 值                |
| -------- | ----------------- |
| 接口地址 | `/dj/toplist/pay` |
| 请求方式 | `GET` / `POST`    |
| 需要登录 | 否                |
| 对应模块 | `dj_toplist_pay`  |
| 文档分类 | 电台与播客        |

## 请求参数

| 参数    | 类型             | 必填 | 默认值 | 说明                                 |
| ------- | ---------------- | :--: | ------ | ------------------------------------ |
| `limit` | number \| string |  —   | 100    | 返回数量，默认为 100 (不支持 offset) |

## HTTP 示例

```bash
GET /dj/toplist/pay?limit=30
```

## 编程式调用

```ts
import { djToplistPay } from 'hana-music-api';

const result = await djToplistPay({
  limit: '30',
});

console.log(result.body);
```

## 返回内容

`body.code`、通到付费榜的 `body.data`、`data.list` 和榜上电台自己的编号 `data.list[].id` 收紧；`data.total`、`data.updateTime`、排名、分数、名称、封面和创作者都是宽松字段。`msg` 在成功录制里只见过 `null`，未声明。接口不支持 `offset`，SDK 的 `limit || 100` 会把 `limit=0` 当默认 `100` 发送；本批录制和探测里没有可达的空结果。非数字或超出 `[1, 100]` 的 `limit` 返回正文 `code: 400`，SDK 按业务拒绝转交 `status: 400`。结构定义和类型是 `DjToplistPayBody`，见 [返回体结构](/guide/response-bodies)。

## 补充说明

说明 : 调用此接口,可获取付费精品电台

**可选参数 :**

`limit` : 返回数量，默认为 100 (不支持 offset)

**接口地址 :** `/dj/toplist/pay`

**调用例子 :** `/dj/toplist/pay?limit=30`
